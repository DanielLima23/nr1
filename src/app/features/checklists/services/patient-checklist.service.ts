import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface PatientChecklistAnswer {
  checklistItemId?: string;
  checklistOptionId?: string;
  explanation?: string;
  question?: string;
  optionLabel?: string;
  requireExplanation?: boolean;
  order?: number;
}

export interface PatientChecklist {
  id?: string;
  patientId?: string;
  checklistId?: string;
  checklistName?: string;
  performedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  answers?: PatientChecklistAnswer[];
}

@Injectable({ providedIn: 'root' })
export class PatientChecklistService extends BaseCrudService {
  private listSubject = new BehaviorSubject<PatientChecklist[]>([]);
  checklists$ = this.listSubject.asObservable();

  private normalizeList(data: any): PatientChecklist[] {
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    if (data?.data) return data.data;
    return [];
  }

  loadAll(companyId: string, patientId: string): Observable<PatientChecklist[]> {
    return this.get<PatientChecklist[]>(`companies/${companyId}/patients/${patientId}/checklists`).pipe(
      tap((res) => {
        const list = this.normalizeList(res);
        this.listSubject.next(list);
      })
    );
  }

  getById(companyId: string, patientId: string, id: string): Observable<PatientChecklist> {
    return this.get<PatientChecklist>(`companies/${companyId}/patients/${patientId}/checklists/${id}`);
  }

  create(companyId: string, patientId: string, payload: Partial<PatientChecklist>): Observable<PatientChecklist> {
    return this.post<PatientChecklist>(`companies/${companyId}/patients/${patientId}/checklists`, payload).pipe(
      tap(() => this.loadAll(companyId, patientId).subscribe())
    );
  }
}
