import { Routes } from '@angular/router';

export const SECTORS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/sector-list/sector-list.page').then((m) => m.SectorListPage),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/sector-create/sector-create.page').then((m) => m.SectorCreatePage),
  },
  {
    path: 'editar/:sectorId',
    loadComponent: () =>
      import('./pages/sector-create/sector-create.page').then((m) => m.SectorCreatePage),
  },
  {
    path: ':sectorId/funcoes',
    loadChildren: () =>
      import('../jobfunctions/jobfunctions.routes').then((m) => m.JOBFUNCTION_ROUTES),
  },
];
