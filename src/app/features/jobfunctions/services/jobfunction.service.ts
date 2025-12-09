import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface JobFunction {
  id?: any;
  name: string;
  description?: string;
}

@Injectable({ providedIn: 'root' })
export class JobFunctionService extends BaseCrudService {
  list(companyId: any, sectorId: any): Observable<JobFunction[]> {
    return this.get<JobFunction[]>(`companies/${companyId}/sectors/${sectorId}/functions`);
  }

  getById(companyId: any, sectorId: any, jobFunctionId: any): Observable<JobFunction> {
    return this.get<JobFunction>(
      `companies/${companyId}/sectors/${sectorId}/functions/${jobFunctionId}`
    );
  }

  create(companyId: any, sectorId: any, body: Partial<JobFunction>): Observable<JobFunction> {
    return this.post<JobFunction>(`companies/${companyId}/sectors/${sectorId}/functions`, body);
  }

  update(
    companyId: any,
    sectorId: any,
    jobFunctionId: any,
    body: Partial<JobFunction>
  ): Observable<JobFunction> {
    return this.put<JobFunction>(
      `companies/${companyId}/sectors/${sectorId}/functions/${jobFunctionId}`,
      body
    );
  }

  deleteById(companyId: any, sectorId: any, jobFunctionId: any): Observable<void> {
    return this.delete<void>(
      `companies/${companyId}/sectors/${sectorId}/functions/${jobFunctionId}`
    );
  }
}
