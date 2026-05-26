import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthService } from '../services/auth-service';

export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  
  // Clone the request and inject the Access Token (if it exists)
  const authReq = token ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : req;
  
  // Send the request on its way
  return next(authReq).pipe(

    catchError((error: HttpErrorResponse) => {

      const isAuthRoute =
        req.url.includes('/auth/signin') ||
        req.url.includes('/auth/signup') ||
        req.url.includes('/auth/refresh');
      
      // Catch 401 Unauthorized errors (but ignore them if the user is currently trying to log in/out)
      if (error.status !== 401 || isAuthRoute) {
        return throwError(() => error);
      }

      // Try to use the HTTP-Only cookie to get a fresh Access Token
      return authService.refreshToken().pipe(

        switchMap((response: any) => {

          // Success! We got a new token. Clone the original request again, but use the NEW token.
          const retriedReq = req.clone({
            setHeaders: {
              Authorization: `Bearer ${response.accessToken}`
            }
          });

          return next(retriedReq);
        }),

        catchError((refreshError) => {
          // The refresh token is dead too. Time to log the user out completely.
          authService.logout();
          return throwError(() => refreshError);
        })
      );
    })
  );
};