import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { PatientRiskService, PatientRisk } from '../../services/patient-risk.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-patient-risks-list',
  standalone: true,
  templateUrl: './patient-risks-list.page.html',
  styleUrls: ['./patient-risks-list.page.scss'],
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
export class PatientRisksListPage extends BaseComponent implements OnInit {
  private service = inject(PatientRiskService);
  override route = inject(ActivatedRoute);

  companyId = this.route.snapshot.queryParamMap.get('companyId') || '';
  patientId = this.route.snapshot.params['patientId'];

  risks: PatientRisk[] = [];
  deletingId: string | null = null;
  selectedName = '';
  showConfirmModal = false;
  confirmLoading = false;

  backLink = ['/admin/pacientes'];
  backQueryParams = this.companyId ? { companyId: this.companyId } : null;
  createLink = ['/admin/pacientes', this.patientId, 'riscos', 'criar'];

  ngOnInit(): void {
    this.load();
  }

  load() {
    if (!this.companyId || !this.patientId) return;
    this.loading.set(true);
    this.service.list(this.companyId, this.patientId).subscribe({
      next: (list) => {
        this.risks = list || [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar riscos do paciente.');
      },
    });
  }

  openDeleteConfirm(row: PatientRisk) {
    this.showConfirmModal = true;
    this.deletingId = row.id;
    this.selectedName = row.riskTitle || 'risco';
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.deletingId = null;
    this.selectedName = '';
    this.confirmLoading = false;
  }

  confirmDelete() {
    if (!this.deletingId || !this.companyId || !this.patientId) return;
    const id = this.deletingId;
    this.confirmLoading = true;
    this.service.remove(this.companyId, this.patientId, id).subscribe({
      next: () => {
        this.toast.success('Risco removido com sucesso!');
        this.closeDeleteConfirm();
        this.load();
      },
      error: () => {
        this.toast.error('Erro ao remover risco.');
        this.deletingId = null;
        this.confirmLoading = false;
      },
    });
  }
}
