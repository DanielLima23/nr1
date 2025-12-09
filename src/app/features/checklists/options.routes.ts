import { Routes } from '@angular/router';

export const CHECKLIST_OPTIONS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/checklist-options-list/checklist-options-list.page').then(
        (m) => m.ChecklistOptionsListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/checklist-options-create/checklist-options-create.page').then(
        (m) => m.ChecklistOptionsCreatePage
      ),
  },
  {
    path: 'editar/:optionId',
    loadComponent: () =>
      import('./pages/checklist-options-create/checklist-options-create.page').then(
        (m) => m.ChecklistOptionsCreatePage
      ),
  },
];
