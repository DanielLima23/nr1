import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { permissionGuard } from './core/guards/permission.guard';
import { MainLayoutComponent } from './layout/components/main-layout/main-layout.component';
import { publicGuard } from './core/guards/public.guard';
import { DashboardHomePage } from './features/dashboard/pages/dashboard-home/dashboard-home.page';
import { PERMISSIONS } from './shared/classes/tipo-permissaso';

export const appRoutes: Routes = [
  // LOGIN (única rota pública)
  {
    path: 'auth',
    canActivate: [publicGuard],
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES),
  },

  // TODAS AS ROTAS PRIVADAS COMEÇAM COM /admin
  {
    path: 'admin',
    component: MainLayoutComponent,
    children: [
      // ROTA INICIAL → admin/dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },

      // DASHBOARD PRIVADO
      {
        path: 'dashboard',
        canActivate: [authGuard, permissionGuard],
        data: { roles: [PERMISSIONS.ADMINISTRADOR, PERMISSIONS.MEDICO, PERMISSIONS.ENGENHEIRO] },
        component: DashboardHomePage,
      },

      // USERS → privado + roles
      {
        path: 'usuarios',
        canActivate: [authGuard, permissionGuard],
        data: { roles: [PERMISSIONS.ADMINISTRADOR] },
        loadChildren: () =>
          import('./features/users/users.routes').then((m) => m.USERS_ROUTES),
      },
      {
        path: 'empresa',
        canActivate: [authGuard, permissionGuard],
        data: { roles: [PERMISSIONS.ADMINISTRADOR, PERMISSIONS.ENGENHEIRO] },
        loadChildren: () =>
          import('./features/empresa/empresa.routes').then(
            (m) => m.EMPRESA_ROUTES
          ),
      },
      {
        path: 'riscos',
        canActivate: [authGuard, permissionGuard],
        data: { roles: [PERMISSIONS.ADMINISTRADOR, PERMISSIONS.ENGENHEIRO] },
        loadChildren: () =>
          import('./features/risks/risks.routes').then(
            (m) => m.RISKS_ROUTES
          ),
      },
      {
        path: 'pacientes',
        canActivate: [authGuard, permissionGuard],
        data: { roles: [PERMISSIONS.ADMINISTRADOR, PERMISSIONS.MEDICO, PERMISSIONS.ENGENHEIRO] },
        loadChildren: () =>
          import('./features/patients/patients.routes').then(
            (m) => m.PATIENTS_ROUTES
          ),
      },
      {
        path: 'medidas-metigadoras-empresa',
        canActivate: [authGuard, permissionGuard],
        data: {
          roles: [
            PERMISSIONS.ADMINISTRADOR,
            PERMISSIONS.ENGENHEIRO,
            PERMISSIONS.EMPRESA,
          ],
        },
        loadChildren: () =>
          import('./features/company-action-plans/company-action-plans.routes').then(
            (m) => m.COMPANY_ACTION_PLANS_ROUTES
          ),
      },
      {
        path: 'checklists',
        canActivate: [authGuard, permissionGuard],
        data: { roles: [PERMISSIONS.ADMINISTRADOR, PERMISSIONS.ENGENHEIRO] },
        loadChildren: () =>
          import('./features/checklists/checklists.routes').then(
            (m) => m.CHECKLISTS_ROUTES
          ),
      },
      // FORBIDDEN
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./features/auth/pages/forbidden/forbidden.page').then(
            (m) => m.ForbiddenPage
          ),
      },
    ],
  },

  // WILDCARD → manda sempre pro dashboard privado
  { path: '**', redirectTo: 'admin/dashboard', pathMatch: 'full' },
];
