import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface Sector {
  id?: any;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class SectorService extends BaseCrudService {
  list(companyId: any): Observable<Sector[]> {
    return this.get<Sector[]>(`companies/${companyId}/sectors`);
  }

  getById(companyId: any, sectorId: any): Observable<Sector> {
    return this.get<Sector>(`companies/${companyId}/sectors/${sectorId}`);
  }

  create(companyId: any, body: Partial<Sector>): Observable<Sector> {
    return this.post<Sector>(`companies/${companyId}/sectors`, body);
  }

  update(companyId: any, sectorId: any, body: Partial<Sector>): Observable<Sector> {
    return this.put<Sector>(`companies/${companyId}/sectors/${sectorId}`, body);
  }

  deleteById(companyId: any, sectorId: any): Observable<void> {
    return this.delete<void>(`companies/${companyId}/sectors/${sectorId}`);
  }
}
