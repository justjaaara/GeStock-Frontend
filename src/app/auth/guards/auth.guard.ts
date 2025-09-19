import { Router, type CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Auth } from '@/auth/services/auth';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  if (authService.isAuthenticated() && authService.isTokenValid()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
