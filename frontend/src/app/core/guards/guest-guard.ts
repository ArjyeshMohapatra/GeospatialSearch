// frontend/src/app/core/guards/guest.guard.ts
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth-service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If they HAVE a token, they shouldn't be here. Send them to the map.
  if (authService.getAccessToken()) {
    router.navigate(['/']); 
    return false;
  } 
  
  // If they don't have a token, let them see the login/signup page.
  return true;
};