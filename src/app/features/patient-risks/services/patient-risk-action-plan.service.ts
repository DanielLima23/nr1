import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';
import { PatientRiskActionPlan } from './patient-risk.service';

@Injectable({ providedIn: 'root' })
export class PatientRiskActionPlanService extends BaseCrudService {
  list(companyId: string, patientId: string, patientRiskId: string): Observable<PatientRiskActionPlan[]> {
    return this.get<PatientRiskActionPlan[]>(
      `companies/${companyId}/patients/${patientId}/risks/${patientRiskId}/action-plans`
    );
  }

  getById(companyId: string, patientId: string, patientRiskId: string, id: string): Observable<PatientRiskActionPlan> {
    return this.get<PatientRiskActionPlan>(
      `companies/${companyId}/patients/${patientId}/risks/${patientRiskId}/action-plans/${id}`
    );
  }

  create(
    companyId: string,
    patientId: string,
    patientRiskId: string,
    body: Partial<PatientRiskActionPlan>
  ): Observable<PatientRiskActionPlan> {
    return this.post<PatientRiskActionPlan>(
      `companies/${companyId}/patients/${patientId}/risks/${patientRiskId}/action-plans`,
      body
    );
  }

  update(
    companyId: string,
    patientId: string,
    patientRiskId: string,
    id: string,
    body: Partial<PatientRiskActionPlan>
  ): Observable<PatientRiskActionPlan> {
    return this.put<PatientRiskActionPlan>(
      `companies/${companyId}/patients/${patientId}/risks/${patientRiskId}/action-plans/${id}`,
      body
    );
  }

  remove(companyId: string, patientId: string, patientRiskId: string, id: string): Observable<void> {
    return super.delete<void>(
      `companies/${companyId}/patients/${patientId}/risks/${patientRiskId}/action-plans/${id}`
    );
  }
}
