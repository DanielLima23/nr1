import { Routes } from '@angular/router';

export const USERS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/users-list/users-list.page')
        .then(m => m.UsersListPage)
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/users-create/users-create.page')
        .then(m => m.UsersCreatePage)
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/users-create/users-create.page')
        .then(m => m.UsersCreatePage)
  }
];
