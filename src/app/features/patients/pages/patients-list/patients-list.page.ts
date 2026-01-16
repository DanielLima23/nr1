import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { PatientService, Patient } from '../../services/patient.service';
import { EmpresaService, Company } from '../../../empresa/services/empresa.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { ImportModalComponent } from '../../../../shared/components/import-modal/import-modal.component';

@Component({
  selector: 'app-patients-list',
  standalone: true,
  templateUrl: './patients-list.page.html',
  styleUrls: ['./patients-list.page.scss'],
  imports: [
    TopPageComponent,
    RouterLink,
    TableModule,
    ButtonModule,
    TooltipModule,
    AsyncPipe,
    DropdownModule,
    FormsModule,
    ConfirmModalComponent,
    ImportModalComponent,
  ],
})
export class PatientsListPage extends BaseComponent implements OnInit {
  patientService = inject(PatientService);
  companyService = inject(EmpresaService);

  patients$ = this.patientService.patients$;
  companies$ = this.companyService.companies$;

  selectedCompanyId: string | null = null;
  showConfirmModal = false;
  selectedId: string | null = null;
  selectedName = '';
  deletingId: string | null = null;
  showImportModal = false;
  importing = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    const companyIdParam = this.route.snapshot.queryParamMap.get('companyId');
    this.companyService.loadCompanies().subscribe({
      next: (list) => {
        const firstId = list?.[0]?.id;
        const targetCompanyId = companyIdParam || firstId || null;
        if (targetCompanyId) {
          this.onCompanyChange(targetCompanyId);
        }
      },
    });
  }

  onCompanyChange(companyId: string | null) {
    this.selectedCompanyId = companyId;
    if (!companyId) return;

    this.loading.set(true);
    this.patientService.loadAll(companyId).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar pacientes.');
      },
    });
  }

  remove(patient: Patient) {
    if (!this.selectedCompanyId || !patient.id) return;
    this.selectedId = patient.id;
    this.selectedName = patient.name ?? '';
    this.showConfirmModal = true;
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.selectedId = null;
    this.selectedName = '';
  }

  confirmDelete() {
    if (!this.selectedCompanyId || !this.selectedId) return;
    const idToRemove = this.selectedId;
    this.deletingId = idToRemove;
    this.showConfirmModal = false;

    this.patientService.deleteById(this.selectedCompanyId, idToRemove).subscribe({
      next: () => {
        this.toast.success('Paciente removido com sucesso!');
        this.deletingId = null;
        this.selectedId = null;
        this.selectedName = '';
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover paciente.');
      },
    });
  }

  openImportModal() {
    this.showImportModal = true;
  }

  closeImportModal() {
    this.showImportModal = false;
  }

  onImportConfirm(data: { companyId: string; file: File }) {
    this.importing = true;

    this.patientService.importFromExcel(data.companyId, data.file).subscribe({
      next: (result) => {
        const message = result?.imported 
          ? `${result.imported} trabalhador(es) importado(s) com sucesso!`
          : 'Trabalhadores importados com sucesso!';
        this.toast.success(message);
        this.importing = false;
        this.showImportModal = false;
        this.onCompanyChange(data.companyId);
      },
      error: (err) => {
        this.importing = false;
        const errorMessage = err?.error?.message 
          || err?.message 
          || 'Erro ao importar trabalhadores. Verifique o formato da planilha.';
        this.toast.error(errorMessage);
      },
    });
  }
}
