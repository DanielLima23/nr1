import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface PatientRisk {
  id: string;
  patientId: string;
  riskId: string;
  riskTitle?: string | null;
  notes?: string | null;
  actionPlans?: PatientRiskActionPlan[];
}

export interface PatientRiskActionPlan {
  id: string;
  patientRiskId: string;
  title?: string | null;
  description?: string | null;
  dueDate?: string | null;
  responsible?: string | null;
  completed: boolean;
  status?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PatientRiskService extends BaseCrudService {
  list(companyId: string, patientId: string): Observable<PatientRisk[]> {
    return this.get<PatientRisk[]>(`companies/${companyId}/patients/${patientId}/risks`);
  }

  getById(companyId: string, patientId: string, id: string): Observable<PatientRisk> {
    return this.get<PatientRisk>(`companies/${companyId}/patients/${patientId}/risks/${id}`);
  }

  create(companyId: string, patientId: string, body: Partial<PatientRisk>): Observable<PatientRisk> {
    return this.post<PatientRisk>(`companies/${companyId}/patients/${patientId}/risks`, body);
  }

  update(companyId: string, patientId: string, id: string, body: Partial<PatientRisk>): Observable<PatientRisk> {
    return this.put<PatientRisk>(`companies/${companyId}/patients/${patientId}/risks/${id}`, body);
  }

  remove(companyId: string, patientId: string, id: string): Observable<void> {
    return super.delete<void>(`companies/${companyId}/patients/${patientId}/risks/${id}`);
  }
}
