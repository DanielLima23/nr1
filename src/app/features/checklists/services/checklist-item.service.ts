import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface ChecklistItemPayload {
  question?: string;
  order?: number;
}

export interface ChecklistItemResponse {
  id?: string;
  question?: string;
  order?: number;
  options?: any[];
}

@Injectable({ providedIn: 'root' })
export class ChecklistItemService extends BaseCrudService {
  list(checklistId: string): Observable<ChecklistItemResponse[]> {
    return this.get<ChecklistItemResponse[]>(`checklists/${checklistId}/items`);
  }

  getById(checklistId: string, id: string): Observable<ChecklistItemResponse> {
    return this.get<ChecklistItemResponse>(`checklists/${checklistId}/items/${id}`);
  }

  create(checklistId: string, payload: ChecklistItemPayload) {
    return this.post(`checklists/${checklistId}/items`, payload);
  }

  update(checklistId: string, id: string, payload: ChecklistItemPayload) {
    return this.put(`checklists/${checklistId}/items/${id}`, payload);
  }

  deleteById(checklistId: string, id: string) {
    return this.delete(`checklists/${checklistId}/items/${id}`);
  }
}
