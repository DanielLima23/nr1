import { AsyncPipe, CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { catchError, forkJoin, map, of } from 'rxjs';
import { DropdownModule } from 'primeng/dropdown';
import { AccordionModule } from 'primeng/accordion';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { EmpresaService } from '../../../empresa/services/empresa.service';
import { Sector, SectorService } from '../../../sectors/services/sector.service';
import {
  CompanyActionPlan,
  CompanyActionPlanUpdatePayload,
  CompanyActionPlansService,
} from '../../services/company-action-plans.service';

interface SectorGroup {
  id: string;
  name: string;
  plans: CompanyActionPlan[];
}

interface CompanyGroup {
  company: any;
  sectors: Sector[];
  groups: SectorGroup[];
  loading: boolean;
}

@Component({
  selector: 'app-company-action-plans',
  standalone: true,
  templateUrl: './company-action-plans.page.html',
  styleUrls: ['./company-action-plans.page.scss'],
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    AccordionModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DialogModule,
    TopPageComponent,
  ],
})
export class CompanyActionPlansPage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private companyService = inject(EmpresaService);
  private sectorService = inject(SectorService);
  private plansService = inject(CompanyActionPlansService);

  companies: CompanyGroup[] = [];
  savingPlanId: string | null = null;

  private planCache = new Map<string, CompanyActionPlan>();
  private forms = new Map<string, FormGroup>();
  detailVisible = false;
  detailData: { title?: string; description?: string; riskTitle?: string } = {};

  statusOptions = [
    { label: 'Pendente', value: 1 },
    { label: 'Em andamento', value: 2 },
    { label: 'Concluido', value: 3 },
  ];

  ngOnInit(): void {
    this.loadCompanies();
  }

  statusClass(value: number | null | undefined): string {
    switch (value) {
      case 3:
        return 'status-ok';
      case 2:
        return 'status-progress';
      default:
        return 'status-pending';
    }
  }

  getForm(planId?: string | number | null): FormGroup | null {
    if (!planId && planId !== 0) return null;
    const id = planId.toString();
    return this.forms.get(id) ?? null;
  }

  totalPlans(cg: CompanyGroup): number {
    if (!cg?.groups?.length) return 0;
    return cg.groups.reduce((acc, g) => acc + (g.plans?.length || 0), 0);
  }

  totalCompanies(): number {
    return this.companies.length;
  }

  countCompletedGroup(group: SectorGroup): number {
    return (group?.plans || []).filter((p) => this.isCompleted(p?.status)).length;
  }

  countCompleted(cg: CompanyGroup): number {
    if (!cg?.groups?.length) return 0;
    return cg.groups.reduce((acc, g) => {
      const done = (g.plans || []).filter((p) => this.isCompleted(p?.status)).length;
      return acc + done;
    }, 0);
  }

  countPending(cg: CompanyGroup): number {
    const total = this.totalPlans(cg);
    const done = this.countCompleted(cg);
    return Math.max(total - done, 0);
  }

  private isCompleted(status: any): boolean {
    const num = Number(status);
    return num === 3;
  }

  resetPlanForm(planId: string | number) {
    const form = this.getForm(planId);
    const cached = this.planCache.get(planId.toString());
    if (!form || !cached) return;
    form.reset({
      title: cached.title || '',
      description: cached.description || '',
      responsible: cached.responsible || '',
      dueDate: this.toDateInput(cached.dueDate),
      status: cached.status ?? 1,
    });
  }

  openDetail(row: any) {
    this.detailData = {
      title: row?.title,
      description: row?.description,
      riskTitle: row?.riskTitle,
    };
    this.detailVisible = true;
  }

  closeDetail() {
    this.detailVisible = false;
    this.detailData = {};
  }

  savePlan(planId: string | number) {
    const form = this.getForm(planId);
    const cached = this.planCache.get(planId.toString());
    if (!form || !cached) return;

    const value = form.value;
    const dueDateValue = value.dueDate;
    const statusValue = value.status;
    const payload: CompanyActionPlanUpdatePayload = {
      title: this.cleanText(value.title ?? cached.title),
      description: this.cleanText(value.description ?? cached.description),
      responsible: this.cleanText(value.responsible ?? cached.responsible),
      dueDate:
        dueDateValue === ''
          ? null
          : dueDateValue
            ? new Date(dueDateValue).toISOString()
            : cached.dueDate || null,
      status:
        statusValue === '' || statusValue === undefined || statusValue === null
          ? cached.status ?? null
          : Number(statusValue),
    };

    this.savingPlanId = planId.toString();
    const companyId =
      (cached as any)['companyId']?.toString?.() ||
      (cached as any).company?.id?.toString?.() ||
      (cached as any).companyId ||
      '';
    const sectorId =
      (cached as any)['sectorId']?.toString?.() ||
      (cached as any).sector?.id?.toString?.() ||
      (cached as any).sectorId ||
      '';

    if (!companyId) {
      this.toast.error('Empresa não identificada para esta medida.');
      this.savingPlanId = null;
      return;
    }

    if (!sectorId) {
      this.toast.error('Setor não identificado para esta medida.');
      this.savingPlanId = null;
      return;
    }

    this.plansService.update(companyId, sectorId, planId.toString(), payload).subscribe({
      next: () => {
        this.toast.success('Medida mitigadora atualizada com sucesso!');
        this.savingPlanId = null;
        this.loadCompanyData(companyId);
      },
      error: () => {
        this.toast.error('Erro ao atualizar medida mitigadora.');
        this.savingPlanId = null;
      },
    });
  }

  private loadCompanies() {
    this.companyService.loadCompanies().subscribe({
      next: (list) => {
        this.companies = (list || []).map((company) => ({
          company,
          sectors: [],
          groups: [],
          loading: true,
        }));

        this.companies.forEach((cg) => {
          const id = cg.company?.id?.toString?.() || cg.company?.id;
          if (id) this.loadCompanyData(id);
        });
      },
      error: () => this.toast.error('Erro ao carregar empresas.'),
    });
  }

  private loadCompanyData(companyId: string) {
    const target = this.companies.find(
      (cg) => (cg.company?.id?.toString?.() || cg.company?.id) === companyId
    );
    if (!target) return;

    this.clearCompanyEntries(companyId);
    target.loading = true;

    this.sectorService.list(companyId).subscribe({
      next: (sectors) => {
        target.sectors = sectors || [];

        const sectorCalls = (target.sectors || []).map((sector) => {
          const sectorId = sector.id?.toString?.() || sector.id;
          if (!sectorId) return of<CompanyActionPlan[]>([]);
          return this.plansService
            .list(companyId, sectorId)
            .pipe(
              map((plans: CompanyActionPlan[]) =>
                (plans || []).map((plan: CompanyActionPlan) => ({
                  ...plan,
                  companyId,
                  sectorId,
                  sectorName: plan?.sectorName ?? sector.name,
                }))
              ),
              catchError(() => of<CompanyActionPlan[]>([]))
            );
        });

        if (!sectorCalls.length) {
          target.groups = this.buildGroups([], target.sectors);
          target.loading = false;
          return;
        }

        forkJoin(sectorCalls).subscribe({
          next: (plansBySector: CompanyActionPlan[][]) => {
            const safePlans: CompanyActionPlan[] = (plansBySector || []).flat();
            safePlans.forEach((plan: CompanyActionPlan) => {
              const planId =
                plan?.id !== undefined && plan?.id !== null ? plan.id.toString() : null;
              if (planId) {
                this.planCache.set(planId, { ...plan, id: planId, companyId: plan.companyId });
                this.forms.set(planId, this.createForm(plan));
              }
            });

            target.groups = this.buildGroups(safePlans, target.sectors);
            target.loading = false;
          },
          error: () => {
            target.loading = false;
            this.toast.error('Erro ao carregar medidas mitigadoras.');
          },
        });
      },
      error: () => {
        target.loading = false;
        this.toast.error('Erro ao carregar setores.');
      },
    });
  }

  private buildGroups(plans: CompanyActionPlan[], sectors: Sector[]) {
    const mapGroups = new Map<string, SectorGroup>();
    const ensureGroup = (id: string, name: string) => {
      if (!mapGroups.has(id)) {
        mapGroups.set(id, { id, name, plans: [] });
      }
      return mapGroups.get(id)!;
    };

    sectors.forEach((sector) => {
      const id = sector.id?.toString() || `sector-${sector.name}`;
      ensureGroup(id, sector.name || 'Setor');
    });

    plans.forEach((plan) => {
      const planId =
        plan?.id !== undefined && plan?.id !== null ? plan.id.toString() : null;
      const sectorId =
        plan.sectorId?.toString() ||
        (plan as any).sectorId ||
        (plan as any).sector?.id?.toString() ||
        'sem-setor';
      const sectorName =
        plan.sectorName ||
        (plan as any).sector?.name ||
        sectors.find((s) => (s.id?.toString() || '') === sectorId)?.name ||
        'Sem setor';

      const group = ensureGroup(sectorId, sectorName);
      group.plans.push(plan);
      if (planId) {
        this.forms.set(planId, this.createForm(plan));
      }
    });

    return Array.from(mapGroups.values());
  }

  private createForm(plan: CompanyActionPlan): FormGroup {
    return this.fb.group({
      title: [plan.title || ''],
      description: [plan.description || ''],
      responsible: [plan.responsible || '', [Validators.maxLength(150)]],
      dueDate: [this.toDateInput(plan.dueDate)],
      status: [plan.status ?? 1],
    });
  }

  private toDateInput(date?: string | null): string {
    if (!date) return '';
    return date.substring(0, 10);
  }

  private cleanText(value?: string | null): string | null {
    const text = value?.trim() || '';
    return text ? text : null;
  }

  private clearCompanyEntries(companyId: string) {
    const idsToRemove: string[] = [];
    this.planCache.forEach((plan, id) => {
      const planCompany =
        (plan as any)['companyId']?.toString?.() ||
        (plan as any).company?.id?.toString?.() ||
        (plan as any).companyId ||
        '';
      if (planCompany === companyId) {
        idsToRemove.push(id);
      }
    });

    idsToRemove.forEach((id) => {
      this.planCache.delete(id);
      this.forms.delete(id);
    });
  }
}
