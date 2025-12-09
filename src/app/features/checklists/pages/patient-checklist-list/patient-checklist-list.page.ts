import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf, CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { PatientChecklistService } from '../../services/patient-checklist.service';

@Component({
  selector: 'app-patient-checklist-list',
  standalone: true,
  templateUrl: './patient-checklist-list.page.html',
  styleUrls: ['./patient-checklist-list.page.scss'],
  imports: [
    CommonModule,
    TopPageComponent,
    RouterLink,
    TableModule,
    ButtonModule,
    TooltipModule,
    AsyncPipe,
    DatePipe,
    NgIf,
  ],
})
export class PatientChecklistListPage extends BaseComponent implements OnInit {
  companyId = this.route.snapshot.queryParamMap.get('companyId') || '';
  patientId = this.route.snapshot.params['patientId'];

  service = inject(PatientChecklistService);
  checklists$ = this.service.checklists$;

  backLink = ['/admin/pacientes'];
  backQueryParams = this.companyId ? { companyId: this.companyId } : null;
  createLink = ['/admin/pacientes', this.patientId, 'checklists', 'criar'];

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (!this.companyId || !this.patientId) return;
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.service.loadAll(this.companyId, this.patientId).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar checklists do paciente.');
      },
    });
  }
}
