import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface CompanyActionPlan {
  id?: string;
  planId?: string;
  companyId?: string;
  jobFunctionId?: string;
  jobFunctionName?: string;
  patientRiskId?: string;
  sectorId?: string;
  sectorName?: string;
  title?: string;
  description?: string;
  dueDate?: string;
  responsible?: string;
  status?: number;
  patientName?: string;
  riskTitle?: string;
  [key: string]: any;
}

export interface CompanyActionPlanUpdatePayload {
  dueDate?: string | null;
  responsible?: string | null;
  status?: number | null;
  completed?: boolean | null;
}

@Injectable({ providedIn: 'root' })
export class CompanyActionPlansService extends BaseCrudService {
  list(companyId: string, sectorId: string): Observable<CompanyActionPlan[]> {
    return this.get<any>(`companies/${companyId}/sectors/${sectorId}/action-plans`).pipe(
      map((res) => this.normalizePlans(res))
    );
  }

  getById(companyId: string, sectorId: string, planId: string): Observable<CompanyActionPlan> {
    return this.get<CompanyActionPlan>(
      `companies/${companyId}/sectors/${sectorId}/action-plans/${planId}`
    );
  }

  update(
    companyId: string,
    sectorId: string,
    planId: string,
    body: CompanyActionPlanUpdatePayload
  ): Observable<any> {
    return this.put<any>(
      `companies/${companyId}/sectors/${sectorId}/action-plans/${planId}`,
      body
    );
  }

  private normalizePlans(data: any): CompanyActionPlan[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.value)) return data.value;
    if (Array.isArray(data?.plans)) return data.plans;
    if (Array.isArray(data?.result)) return data.result;
    return [];
  }
}
