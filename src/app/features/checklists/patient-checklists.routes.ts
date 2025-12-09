import { Routes } from '@angular/router';

export const PATIENT_CHECKLIST_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/patient-checklist-list/patient-checklist-list.page').then(
        (m) => m.PatientChecklistListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/patient-checklist-create/patient-checklist-create.page').then(
        (m) => m.PatientChecklistCreatePage
      ),
  },
  {
    path: ':id',
    loadComponent: () =>
      import('./pages/patient-checklist-detail/patient-checklist-detail.page').then(
        (m) => m.PatientChecklistDetailPage
      ),
  },
];
