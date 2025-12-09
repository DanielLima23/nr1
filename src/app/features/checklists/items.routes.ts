import { Routes } from '@angular/router';

export const CHECKLIST_ITEMS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/checklist-items-list/checklist-items-list.page').then(
        (m) => m.ChecklistItemsListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/checklist-items-create/checklist-items-create.page').then(
        (m) => m.ChecklistItemsCreatePage
      ),
  },
  {
    path: 'editar/:itemId',
    loadComponent: () =>
      import('./pages/checklist-items-create/checklist-items-create.page').then(
        (m) => m.ChecklistItemsCreatePage
      ),
  },
  {
    path: ':itemId/opcoes',
    loadChildren: () =>
      import('./options.routes').then((m) => m.CHECKLIST_OPTIONS_ROUTES),
  },
];
