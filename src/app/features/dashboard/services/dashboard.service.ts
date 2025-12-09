import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface DashboardCompany {
  companyId: string;
  name: string | null;
  totalPlans: number;
  completedPlans: number;
  progressPercent: number;
}

export interface DashboardCompanyPaged {
  page: number;
  pageSize: number;
  totalCount: number;
  items: DashboardCompany[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseCrudService {
  getCompanies(page = 1, pageSize = 10): Observable<DashboardCompanyPaged> {
    return this.get<DashboardCompanyPaged>(
      `dashboard/companies?page=${page}&pageSize=${pageSize}`
    );
  }
}
