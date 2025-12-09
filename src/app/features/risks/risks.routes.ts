import { Routes } from '@angular/router';

export const RISKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/risks-list/risks-list.page').then(
        (m) => m.RisksListPage
      ),
  },
  {
    path: ':riskId/acoes',
    loadChildren: () =>
      import('../actions/actions.routes').then((m) => m.ACTIONS_ROUTES),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/risks-create/risks-create.page').then(
        (m) => m.RisksCreatePage
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/risks-create/risks-create.page').then(
        (m) => m.RisksCreatePage
      ),
  },
];
