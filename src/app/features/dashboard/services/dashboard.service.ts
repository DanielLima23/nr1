import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface DashboardCompany {
  companyId: string;
  name: string | null;
  totalPlans: number;
  completedPlans: number;
  progressPercent: number;
}

export interface DashboardCompanyPaged {
  page: number;
  pageSize: number;
  totalCount: number;
  items: DashboardCompany[];
}

@Injectable({ providedIn: 'root' })
export class DashboardService extends BaseCrudService {
  getCompanies(page = 1): Observable<DashboardCompanyPaged> {
    return this.get<any>('companies').pipe(
      map((res) => this.normalizeCompanies(res)),
      switchMap((companies) => {
        if (!companies.length) {
          return of({
            page,
            pageSize: 0,
            totalCount: 0,
            items: [],
          });
        }

        const companyRequests = companies.map((company: any) =>
          this.buildCompanyDashboardItem(company)
        );

        return forkJoin(companyRequests).pipe(
          map((items) => ({
            page,
            pageSize: items.length,
            totalCount: items.length,
            items: items || [],
          }))
        );
      }),
      catchError(() =>
        of({
          page,
          pageSize: 0,
          totalCount: 0,
          items: [],
        })
      )
    );
  }

  private buildCompanyDashboardItem(company: any): Observable<DashboardCompany> {
    const companyId = this.extractCompanyId(company);
    const name = this.extractCompanyName(company);

    if (!companyId) {
      return of(this.composeCompanySummary('', name, []));
    }

    return this.get<any[]>(`companies/${companyId}/sectors`).pipe(
      switchMap((sectors) => {
        const sectorList = this.normalizeCompanies(sectors);

        const sectorCalls = (sectorList || []).map((sector: any) => {
          const sectorId = sector?.id;
          if (!sectorId) return of<any[]>([]);

          return this.get<any[]>(
            `companies/${companyId}/sectors/${sectorId}/action-plans`
          ).pipe(
            map((res) => this.normalizePlans(res)),
            catchError(() => of<any[]>([]))
          );
        });

        if (!sectorCalls.length) {
          return of(this.composeCompanySummary(companyId, name, []));
        }

        return forkJoin(sectorCalls).pipe(
          map((sectorPlans) => {
            const allPlans = (sectorPlans || []).flat();
            return this.composeCompanySummary(companyId, name, allPlans);
          }),
          catchError(() => of(this.composeCompanySummary(companyId, name, [])))
        );
      }),
      catchError(() => of(this.composeCompanySummary(companyId, name, [])))
    );
  }

  private composeCompanySummary(
    companyId: any,
    name: string | null,
    plans: any[]
  ): DashboardCompany {
    const totalPlans = plans?.length || 0;
    const completedPlans = (plans || []).filter((plan) =>
      this.isPlanCompleted(plan)
    ).length;
    const progressPercent =
      totalPlans > 0 ? Math.round((completedPlans / totalPlans) * 100) : 0;

    return {
      companyId: companyId?.toString?.() ?? companyId ?? '',
      name,
      totalPlans,
      completedPlans,
      progressPercent,
    };
  }

  private normalizeCompanies(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    return [];
  }

  private normalizePlans(data: any): any[] {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.items)) return data.items;
    if (Array.isArray(data?.data)) return data.data;
    if (Array.isArray(data?.plans)) return data.plans;
    return [];
  }

  private extractCompanyId(item: any): string {
    const id =
      item?.companyId ??
      item?.companyID ??
      item?.company_id ??
      item?.id ??
      item?.company?.id ??
      item?.company?.companyId ??
      item?.company?.companyID ??
      item?.company?.company_id;

    if (id === undefined || id === null) return '';
    return id.toString();
  }

  private extractCompanyName(item: any): string | null {
    return (
      item?.companyName ??
      item?.company_name ??
      item?.name ??
      item?.company?.name ??
      item?.company?.companyName ??
      item?.company?.fantasyName ??
      null
    );
  }

  private isPlanCompleted(plan: any): boolean {
    const completedFlag =
      plan?.completed ??
      plan?.isCompleted ??
      plan?.done ??
      plan?.finished ??
      plan?.concluded;

    if (completedFlag === true) return true;

    const status =
      plan?.status ??
      plan?.statusId ??
      plan?.planStatus ??
      plan?.actionPlanStatus ??
      plan?.situacao;

    if (status !== undefined && status !== null) {
      const statusNumber = Number(status);
      if (!Number.isNaN(statusNumber)) return statusNumber === 3;
      if (typeof status === 'string') {
        const normalized = status.toLowerCase();
        if (
          normalized.includes('concluido') ||
          normalized.includes('concluido') ||
          normalized.includes('completed') ||
          normalized.includes('done') ||
          normalized.includes('finalizado')
        ) {
          return true;
        }
      }
    }

    return false;
  }
}
