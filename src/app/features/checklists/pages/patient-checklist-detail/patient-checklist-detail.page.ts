import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe, DatePipe, NgIf, CommonModule } from '@angular/common';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { PatientChecklist, PatientChecklistService } from '../../services/patient-checklist.service';

@Component({
  selector: 'app-patient-checklist-detail',
  standalone: true,
  templateUrl: './patient-checklist-detail.page.html',
  styleUrls: ['./patient-checklist-detail.page.scss'],
  imports: [CommonModule, TopPageComponent, AsyncPipe, DatePipe, NgIf],
})
export class PatientChecklistDetailPage extends BaseComponent implements OnInit {
  private service = inject(PatientChecklistService);

  companyId = this.route.snapshot.queryParamMap.get('companyId') || '';
  patientId = this.route.snapshot.params['patientId'];
  checklistId = this.route.snapshot.params['id'];

  checklist: PatientChecklist | null = null;

  backLink = ['/admin/pacientes', this.patientId, 'checklists'];
  backQueryParams = this.companyId ? { companyId: this.companyId } : null;

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (!this.companyId || !this.patientId || !this.checklistId) return;
    this.load();
  }

  private load() {
    this.service.getById(this.companyId, this.patientId, this.checklistId).subscribe({
      next: (data) => (this.checklist = data),
      error: () => this.toast.error('Erro ao carregar checklist.'),
    });
  }
}
