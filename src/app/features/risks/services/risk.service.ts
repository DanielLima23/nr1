import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface Risk {
  id?: string;
  title?: string;
  description?: string;
  probability?: number;
  impact?: number;
  score?: number;
  mitigation?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class RiskService extends BaseCrudService {
  private risksSubject = new BehaviorSubject<Risk[]>([]);
  risks$ = this.risksSubject.asObservable();

  private normalizeList(data: any): Risk[] {
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    if (data?.data) return data.data;
    return [];
  }

  loadAll(): Observable<Risk[]> {
    return this.get<Risk[]>('risks').pipe(
      tap((res) => {
        const list = this.normalizeList(res);
        this.risksSubject.next(list);
      })
    );
  }

  getById(id: string): Observable<Risk> {
    return this.get<Risk>(`risks/${id}`);
  }

  create(payload: Partial<Risk>): Observable<Risk> {
    return this.post<Risk>('risks', payload).pipe(
      tap(() => this.loadAll().subscribe())
    );
  }

  update(id: string, payload: Partial<Risk>): Observable<Risk> {
    return this.put<Risk>(`risks/${id}`, payload).pipe(
      tap(() => this.loadAll().subscribe())
    );
  }

  deleteById(id: string): Observable<any> {
    return this.delete<any>(`risks/${id}`).pipe(
      tap(() => this.loadAll().subscribe())
    );
  }
}
