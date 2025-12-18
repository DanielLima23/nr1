import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const permissionGuard: CanActivateFn = (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Se não estiver logado → manda para login
  if (!auth.isLogged()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const authData = auth.authData;
  const userRole = authData?.user?.role?.toString?.().toLowerCase();

  if (!userRole) {
    router.navigate(['/admin/forbidden']);
    return false;
  }

  // Roles exigidas pela rota
  const requiredRoles = route.data?.['roles'] as string[] | undefined;

  // Se a rota não exige role → libera
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  // Verifica se usuário possui a role
  const normalizedRequired = (requiredRoles || []).map((r) => r?.toString?.().toLowerCase());
  const allowed = normalizedRequired.includes(userRole);

  if (!allowed) {
    router.navigate(['/admin/forbidden']);
    return false;
  }

  return true;
};
