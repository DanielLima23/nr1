import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

@Injectable({ providedIn: 'root' })
export class UsersService extends BaseCrudService {

  private usersSubject = new BehaviorSubject<any[]>([]);
  users$ = this.usersSubject.asObservable();

  private normalizeList(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    if (data?.data) return data.data;
    return [];
  }

  loadUsers(): Observable<any[]> {
    return this.get<any>('users').pipe(
      tap((res) => {
        const list = this.normalizeList(res);
        this.usersSubject.next(list);
      })
    );
  }

  loadProfiles(): Observable<any[]> {
    return this.get<any[]>('access/profiles');
  }

  getById(id: any): Observable<any> {
    return this.get<any>(`users/${id}`);
  }

  create(data: any): Observable<any> {
    return this.post<any>('users', data).pipe(
      tap(() => this.loadUsers().subscribe())
    );
  }

  update(id: any, data: any): Observable<any> {
    return this.put<any>(`users/${id}`, data).pipe(
      tap(() => this.loadUsers().subscribe())
    );
  }

  deleteById(id: any): Observable<any> {
    return this.delete<any>(`users/${id}`).pipe(
      tap(() => this.loadUsers().subscribe())
    );
  }
}
