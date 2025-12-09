import { Routes } from '@angular/router';

export const PATIENTS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/patients-list/patients-list.page').then(
        (m) => m.PatientsListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/patients-create/patients-create.page').then(
        (m) => m.PatientsCreatePage
      ),
  },
  {
    path: 'editar/:id',
    loadComponent: () =>
      import('./pages/patients-create/patients-create.page').then(
        (m) => m.PatientsCreatePage
      ),
  },
  {
    path: ':patientId/riscos',
    loadChildren: () =>
      import('../patient-risks/patient-risks.routes').then((m) => m.PATIENT_RISKS_ROUTES),
  },
  {
    path: ':patientId/checklists',
    loadChildren: () =>
      import('../checklists/patient-checklists.routes').then((m) => m.PATIENT_CHECKLIST_ROUTES),
  },
];

