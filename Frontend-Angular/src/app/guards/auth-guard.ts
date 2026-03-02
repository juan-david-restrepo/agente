import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';


export const authGuard: CanActivateFn = () => {

  const authService = inject(AuthService);
  const router = inject(Router);

  const isLogged = !!localStorage.getItem('token');

  if (!isLogged) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
