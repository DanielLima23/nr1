import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';
import { ActivatedRoute } from '@angular/router';

export interface ActionPlan {
  id?: string;
  riskId?: string;
  title?: string;
  description?: string;
  dueDate?: string;
  responsible?: string;
  completed?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class ActionPlanService extends BaseCrudService {
  private route = inject(ActivatedRoute);

  private actionsSubject = new BehaviorSubject<ActionPlan[]>([]);
  actions$ = this.actionsSubject.asObservable();

  riskIdFromRoute(): string | null {
    return this.route.snapshot.params['riskId'] ?? null;
  }

  private normalizeList(data: any): ActionPlan[] {
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    if (data?.data) return data.data;
    return [];
  }

  loadAll(riskId: string): Observable<ActionPlan[]> {
    return this.get<ActionPlan[]>(`risks/${riskId}/action-plans`).pipe(
      tap((res) => {
        const list = this.normalizeList(res);
        this.actionsSubject.next(list);
      })
    );
  }

  getById(riskId: string, id: string): Observable<ActionPlan> {
    return this.get<ActionPlan>(`risks/${riskId}/action-plans/${id}`);
  }

  create(riskId: string, payload: Partial<ActionPlan>): Observable<ActionPlan> {
    return this.post<ActionPlan>(`risks/${riskId}/action-plans`, payload).pipe(
      tap(() => this.loadAll(riskId).subscribe())
    );
  }

  update(riskId: string, id: string, payload: Partial<ActionPlan>): Observable<ActionPlan> {
    return this.put<ActionPlan>(`risks/${riskId}/action-plans/${id}`, payload).pipe(
      tap(() => this.loadAll(riskId).subscribe())
    );
  }

  deleteById(riskId: string, id: string): Observable<any> {
    return this.delete<any>(`risks/${riskId}/action-plans/${id}`).pipe(
      tap(() => this.loadAll(riskId).subscribe())
    );
  }
}
