import { Routes } from '@angular/router';

export const PATIENT_RISKS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/patient-risks-list/patient-risks-list.page').then(
        (m) => m.PatientRisksListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/patient-risk-create/patient-risk-create.page').then(
        (m) => m.PatientRiskCreatePage
      ),
  },
  {
    path: 'editar/:riskId',
    loadComponent: () =>
      import('./pages/patient-risk-create/patient-risk-create.page').then(
        (m) => m.PatientRiskCreatePage
      ),
  },
  {
    path: ':riskId/planos',
    loadChildren: () =>
      import('./patient-risk-action-plans.routes').then(
        (m) => m.PATIENT_RISK_ACTION_PLANS_ROUTES
      ),
  },
];
