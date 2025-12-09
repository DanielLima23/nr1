import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface Patient {
  id?: string;
  companyId?: string;
  jobFunctionId?: string;
  jobFunctionName?: string;
  sectorId?: string;
  sectorName?: string;
  name?: string;
  birthDate?: string;
  tenureMonths?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService extends BaseCrudService {
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  patients$ = this.patientsSubject.asObservable();

  private normalizeList(data: any): Patient[] {
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    if (data?.data) return data.data;
    return [];
  }

  loadAll(companyId: string): Observable<Patient[]> {
    return this.get<Patient[]>(`companies/${companyId}/patients`).pipe(
      tap((res) => {
        const list = this.normalizeList(res);
        this.patientsSubject.next(list);
      })
    );
  }

  getById(companyId: string, id: string): Observable<Patient> {
    return this.get<Patient>(`companies/${companyId}/patients/${id}`);
  }

  create(companyId: string, payload: Partial<Patient>): Observable<Patient> {
    return this.post<Patient>(`companies/${companyId}/patients`, payload).pipe(
      tap(() => this.loadAll(companyId).subscribe())
    );
  }

  update(companyId: string, id: string, payload: Partial<Patient>): Observable<Patient> {
    return this.put<Patient>(`companies/${companyId}/patients/${id}`, payload).pipe(
      tap(() => this.loadAll(companyId).subscribe())
    );
  }

  deleteById(companyId: string, id: string): Observable<any> {
    return this.delete<any>(`companies/${companyId}/patients/${id}`).pipe(
      tap(() => this.loadAll(companyId).subscribe())
    );
  }
}
