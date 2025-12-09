import { Injectable } from '@angular/core';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface ChecklistOption {
  id?: string;
  label?: string;
  requireExplanation?: boolean;
  order?: number;
}

export interface ChecklistItem {
  id?: string;
  question?: string;
  order?: number;
  options?: ChecklistOption[];
}

export interface Checklist {
  id?: string;
  name?: string;
  description?: string;
  items?: ChecklistItem[];
}

@Injectable({ providedIn: 'root' })
export class ChecklistService extends BaseCrudService {
  list() {
    return this.get<Checklist[]>(`checklists`);
  }

  getById(id: string) {
    return this.get<Checklist>(`checklists/${id}`);
  }

  create(payload: Partial<Checklist>) {
    return this.post<Checklist>('checklists', payload);
  }

  update(id: string, payload: Partial<Checklist>) {
    return this.put<Checklist>(`checklists/${id}`, payload);
  }

  deleteById(id: string) {
    return this.delete<any>(`checklists/${id}`);
  }
}
