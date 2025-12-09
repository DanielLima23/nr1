import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const publicGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // se já está logado, bloqueia qualquer rota pública
  if (auth.isLogged()) {
    router.navigate(['/admin/dashboard']);
    return false;
  }

  return true;
};
