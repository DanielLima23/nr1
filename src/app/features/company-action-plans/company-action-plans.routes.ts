import { Routes } from '@angular/router';

export const COMPANY_ACTION_PLANS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/company-action-plans/company-action-plans.page').then(
        (m) => m.CompanyActionPlansPage
      ),
  },
];
