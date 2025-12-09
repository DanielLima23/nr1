import { Routes } from '@angular/router';

export const PATIENT_RISK_ACTION_PLANS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/patient-risk-action-plans-list/patient-risk-action-plans-list.page').then(
        (m) => m.PatientRiskActionPlansListPage
      ),
  },
  {
    path: 'criar',
    loadComponent: () =>
      import('./pages/patient-risk-action-plan-create/patient-risk-action-plan-create.page').then(
        (m) => m.PatientRiskActionPlanCreatePage
      ),
  },
  {
    path: 'editar/:actionPlanId',
    loadComponent: () =>
      import('./pages/patient-risk-action-plan-create/patient-risk-action-plan-create.page').then(
        (m) => m.PatientRiskActionPlanCreatePage
      ),
  },
];
