import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { PatientRiskActionPlanService } from '../../services/patient-risk-action-plan.service';
import { PatientRiskService, PatientRiskActionPlan } from '../../services/patient-risk.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-patient-risk-action-plans-list',
  standalone: true,
  templateUrl: './patient-risk-action-plans-list.page.html',
  styleUrls: ['./patient-risk-action-plans-list.page.scss'],
  imports: [
    CommonModule,
    TopPageComponent,
    RouterLink,
    TableModule,
    ButtonModule,
    TooltipModule,
    AsyncPipe,
    DatePipe,
    ConfirmModalComponent,
  ],
})
export class PatientRiskActionPlansListPage extends BaseComponent implements OnInit {
  private service = inject(PatientRiskActionPlanService);
  private riskService = inject(PatientRiskService);
  override route = inject(ActivatedRoute);

  companyId = this.route.snapshot.queryParamMap.get('companyId') || '';
  patientId = this.route.snapshot.params['patientId'];
  riskId = this.route.snapshot.params['riskId'];
  riskTitle = '';

  plans: PatientRiskActionPlan[] = [];
  deletingId: string | null = null;
  showConfirmModal = false;
  confirmLoading = false;

  backLink = ['/admin/pacientes', this.patientId, 'riscos'];
  backQueryParams = this.companyId ? { companyId: this.companyId } : null;
  createLink = ['/admin/pacientes', this.patientId, 'riscos', this.riskId, 'planos', 'criar'];

  ngOnInit(): void {
    this.loadRiskTitle();
    this.load();
  }

  private loadRiskTitle() {
    if (!this.companyId || !this.patientId || !this.riskId) return;
    this.riskService.getById(this.companyId, this.patientId, this.riskId).subscribe({
      next: (risk) => (this.riskTitle = risk.riskTitle || ''),
    });
  }

  load() {
    if (!this.companyId || !this.patientId || !this.riskId) return;
    this.loading.set(true);
    this.service.list(this.companyId, this.patientId, this.riskId).subscribe({
      next: (list) => {
        this.plans = list || [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar planos.');
      },
    });
  }

  openDeleteConfirm(row: PatientRiskActionPlan) {
    this.showConfirmModal = true;
    this.deletingId = row.id;
    this.confirmLoading = false;
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.deletingId = null;
    this.confirmLoading = false;
  }

  confirmDelete() {
    if (!this.deletingId || !this.companyId || !this.patientId || !this.riskId) return;
    const id = this.deletingId;
    this.confirmLoading = true;
    this.service.remove(this.companyId, this.patientId, this.riskId, id).subscribe({
      next: () => {
        this.toast.success('Medida mitigadora removida com sucesso!');
        this.closeDeleteConfirm();
        this.load();
      },
      error: () => {
        this.toast.error('Erro ao remover medida mitigadora.');
        this.deletingId = null;
        this.confirmLoading = false;
      },
    });
  }
}
