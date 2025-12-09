import { Routes } from '@angular/router';

export const CHECKLISTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/checklists-list/checklists-list.page').then(
        (m) => m.ChecklistsListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/checklists-create/checklists-create.page').then(
        (m) => m.ChecklistsCreatePage
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/checklists-create/checklists-create.page').then(
        (m) => m.ChecklistsCreatePage
      ),
  },
  {
    path: ':checklistId/itens',
    loadChildren: () =>
      import('./items.routes').then((m) => m.CHECKLIST_ITEMS_ROUTES),
  },
];
