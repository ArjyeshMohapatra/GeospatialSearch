import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import { BehaviorSubject, Observable, tap, catchError, throwError } from 'rxjs';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authApiUrl = `${environment.apiUrl}/api/auth`;

  // This BehaviorSubject lets components subscribe to the login state
  // It checks if a token exists on startup to keep the user logged in
  private loggedInSubject = new BehaviorSubject<boolean>(!!this.getAccessToken());
  public isLoggedIn$ = this.loggedInSubject.asObservable();

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private setAccessToken(token: string): void{
    localStorage.setItem('accessToken', token);
    this.loggedInSubject.next(true);
  }

  private clearToken(): void {
    localStorage.removeItem('accessToken');
    this.loggedInSubject.next(false);
  }

  signup(credentials: User): Observable<any>{
    return this.http.post<{ accessToken: string }>(`${this.authApiUrl}/signup`, credentials);
  }

  signin(credetials: User): Observable<any>{
    return this.http.post<{ accessToken: string }>(`${this.authApiUrl}/signin`, credetials, { withCredentials: true })
      .pipe(
        tap(response => {
          this.setAccessToken(response.accessToken);
        })
      );
  }

  refreshToken(): Observable<any> {
    return this.http.post<{ accessToken: string }>(`${this.authApiUrl}/refresh`, {}, { withCredentials: true })
      .pipe(
      tap(response => {
        this.setAccessToken(response.accessToken);
      })
    );
  }

  logout(): void {
    this.http.post(`${this.authApiUrl}/logout`, {}, { withCredentials: true })
      .pipe(
      catchError(err => throwError(() => err))
    ).subscribe({
      next: () => {
        this.clearToken();
        this.router.navigate(['/signin']);
      },
      error: () => {
        this.clearToken();
        this.router.navigate(['/signin']);
      }
    });
  }
}
