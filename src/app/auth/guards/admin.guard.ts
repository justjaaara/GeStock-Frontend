import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { Auth } from '@/auth/services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);

  const isAuthenticated = authService.isAuthenticated();
  const userProfile = authService.userProfile();

  // Verificar si está autenticado
  if (!isAuthenticated) {
    console.warn('❌ Usuario no autenticado, redirigiendo a login');
    router.navigate(['/auth/login']);
    return false;
  }

  // Verificar si es administrador (role_id = 1 en BD se mapea como 'ADMIN')
  const isAdmin = userProfile?.role === 'ADMIN';

  if (!isAdmin) {
    console.warn('❌ Acceso denegado: El usuario no es administrador');
    router.navigate(['/dashboard']); // Redirigir al dashboard si no es admin
    return false;
  }

  return true;
};
