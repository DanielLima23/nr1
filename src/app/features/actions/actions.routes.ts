import { Routes } from '@angular/router';

export const ACTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/actions-list/actions-list.page').then(
        (m) => m.ActionsListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/actions-create/actions-create.page').then(
        (m) => m.ActionsCreatePage
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/actions-create/actions-create.page').then(
        (m) => m.ActionsCreatePage
      ),
  },
];
