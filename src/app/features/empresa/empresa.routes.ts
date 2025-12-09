import { Routes } from '@angular/router';

export const EMPRESA_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/empresa-list/empresa-list.page').then(
        (m) => m.EmpresaListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/empresa-create.page/empresa-create.page').then(
        (m) => m.EmpresaCreatePage
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/empresa-create.page/empresa-create.page').then(
        (m) => m.EmpresaCreatePage
      ),
  },
  {
    path: ':id/setores',
    loadChildren: () =>
      import('../sectors/sectors.routes').then((m) => m.SECTORS_ROUTES),
  },
];
