import { Routes } from '@angular/router';

export const JOBFUNCTION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/jobfunction-list/jobfunction-list.page').then((m) => m.JobFunctionListPage),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/jobfunction-create/jobfunction-create.page').then(
        (m) => m.JobFunctionCreatePage
      ),
  },
  {
    path: 'editar/:jobFunctionId',
    loadComponent: () =>
      import('./pages/jobfunction-create/jobfunction-create.page').then(
        (m) => m.JobFunctionCreatePage
      ),
  },
];
