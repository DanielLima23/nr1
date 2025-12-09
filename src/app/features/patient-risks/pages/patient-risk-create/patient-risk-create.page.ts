import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { PatientRiskService } from '../../services/patient-risk.service';
import { RiskService } from '../../../risks/services/risk.service';
import { RouterLink, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-patient-risk-create',
  standalone: true,
  templateUrl: './patient-risk-create.page.html',
  styleUrls: ['./patient-risk-create.page.scss'],
  imports: [
    CommonModule,
    TopPageComponent,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    RouterLink,
  ],
})
export class PatientRiskCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PatientRiskService);
  private riskService = inject(RiskService);
  override route = inject(ActivatedRoute);

  companyId = this.route.snapshot.queryParamMap.get('companyId') || '';
  patientId = this.route.snapshot.params['patientId'];
  riskIdParam = this.route.snapshot.params['riskId'];
  submitted = false;
  backQueryParams = this.companyId ? { companyId: this.companyId } : null;

  risksOptions: any[] = [];

  form = this.fb.group({
    riskId: ['', Validators.required],
    notes: [''],
  });

  ngOnInit(): void {
    this.loadRisks();
    if (this.riskIdParam) {
      this.loadRisk(this.riskIdParam);
    }
  }

  private loadRisks() {
    this.riskService.loadAll().subscribe({
      next: (list: any) => {
        this.risksOptions = (list || []).map((r: any) => ({
          label: r.title,
          value: r.id,
        }));
      },
      error: () => this.toast.error('Erro ao carregar riscos.'),
    });
  }

  private loadRisk(id: string) {
    if (!this.companyId || !this.patientId) return;
    this.service.getById(this.companyId, this.patientId, id).subscribe({
      next: (risk) => {
        this.form.patchValue({
          riskId: risk.riskId,
          notes: risk.notes,
        });
      },
      error: () => this.toast.error('Erro ao carregar risco.'),
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid || !this.companyId || !this.patientId) {
      this.form.markAllAsTouched();
      return;
    }

    const payload: any = {
      riskId: this.form.value.riskId || undefined,
      notes: this.form.value.notes?.trim() || undefined,
    };

    if (this.riskIdParam) {
      this.service.update(this.companyId, this.patientId, this.riskIdParam, payload).subscribe({
        next: () => {
          this.toast.success('Risco atualizado com sucesso!');
          this.router.navigate(['/admin/pacientes', this.patientId, 'riscos'], {
            queryParams: { companyId: this.companyId },
          });
        },
        error: () => this.toast.error('Erro ao atualizar risco.'),
      });
    } else {
      this.service.create(this.companyId, this.patientId, payload).subscribe({
        next: () => {
          this.toast.success('Risco criado com sucesso!');
          this.router.navigate(['/admin/pacientes', this.patientId, 'riscos'], {
            queryParams: { companyId: this.companyId },
          });
        },
        error: () => this.toast.error('Erro ao criar risco.'),
      });
    }
  }
}
