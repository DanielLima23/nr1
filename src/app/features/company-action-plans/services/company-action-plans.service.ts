import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface CompanyActionPlan {
  id?: string;
  planId?: string;
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
  title?: string | null;
  description?: string | null;
  dueDate?: string | null;
  responsible?: string | null;
  status?: number | null;
}

@Injectable({ providedIn: 'root' })
export class CompanyActionPlansService extends BaseCrudService {
  list(companyId: string): Observable<CompanyActionPlan[]> {
    return this.get<any[]>(`companies/${companyId}/action-plans`).pipe(
      // API retorna agrupado por funÁÆo/sector; aqui achatamos para facilitar o template.
      map((data: any[] = []) => {
        const flat: CompanyActionPlan[] = [];

        data.forEach((group) => {
          const plans = Array.isArray(group?.plans) ? group.plans : [];
          plans.forEach((plan: any) => {
            const planId = plan?.planId || plan?.id;
            flat.push({
              ...plan,
              id: planId,
              planId,
              sectorId: group?.sectorId,
              sectorName: group?.sectorName,
              jobFunctionId: group?.jobFunctionId,
              jobFunctionName: group?.jobFunctionName,
            });
          });
        });

        return flat;
      })
    );
  }

  update(companyId: string, planId: string, body: CompanyActionPlanUpdatePayload): Observable<any> {
    return this.put<any>(`companies/${companyId}/action-plans/${planId}`, body);
  }
}
