import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface ChecklistOptionPayload {
  label?: string;
  requireExplanation?: boolean;
  order?: number;
}

export interface ChecklistOptionResponse {
  id?: string;
  label?: string;
  requireExplanation?: boolean;
  order?: number;
}

@Injectable({ providedIn: 'root' })
export class ChecklistOptionService extends BaseCrudService {
  list(checklistId: string, itemId: string): Observable<ChecklistOptionResponse[]> {
    return this.get<ChecklistOptionResponse[]>(`checklists/${checklistId}/items/${itemId}/options`);
  }

  getById(checklistId: string, itemId: string, id: string): Observable<ChecklistOptionResponse> {
    return this.get<ChecklistOptionResponse>(`checklists/${checklistId}/items/${itemId}/options/${id}`);
  }

  create(checklistId: string, itemId: string, payload: ChecklistOptionPayload) {
    return this.post(`checklists/${checklistId}/items/${itemId}/options`, payload);
  }

  update(checklistId: string, itemId: string, id: string, payload: ChecklistOptionPayload) {
    return this.put(`checklists/${checklistId}/items/${itemId}/options/${id}`, payload);
  }

  deleteById(checklistId: string, itemId: string, id: string) {
    return this.delete(`checklists/${checklistId}/items/${itemId}/options/${id}`);
  }
}
