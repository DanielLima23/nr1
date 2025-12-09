import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface Company {
  id: any;
  name: string;
  document?: string;
  active?: boolean;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class EmpresaService extends BaseCrudService {
  private companiesSubject = new BehaviorSubject<Company[]>([]);
  companies$ = this.companiesSubject.asObservable();

  private normalizeList(data: any): Company[] {
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    if (data?.data) return data.data;
    return [];
  }

  loadCompanies(): Observable<Company[]> {
    return this.get<any>('companies').pipe(
      tap((res) => {
        const list = this.normalizeList(res);
        this.companiesSubject.next(list);
      })
    );
  }

  getById(id: any): Observable<Company> {
    return this.get<Company>(`companies/${id}`);
  }

  create(body: Partial<Company>): Observable<Company> {
    return this.post<Company>('companies', body).pipe(
      tap(() => this.loadCompanies().subscribe())
    );
  }

  update(id: any, body: Partial<Company>): Observable<Company> {
    return this.put<Company>(`companies/${id}`, body).pipe(
      tap(() => this.loadCompanies().subscribe())
    );
  }

  deleteById(id: any): Observable<void> {
    return this.delete<void>(`companies/${id}`).pipe(
      tap(() => this.loadCompanies().subscribe())
    );
  }
}
