import { inject } from '@angular/core';
import { CanActivateFn } from '@angular/router';
import { AuthService } from '../service/auth.service';
import { Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';

export const adminGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  return authService.getCurrentUser().pipe(
    map((user) => {
      if (user.role === 'ADMIN') {
        return true;
      }
      router.navigate(['/home']);
      return false;
    }),

    catchError(() => {
      router.navigate(['/login']);
      return of(false);
    }),
  );
};

