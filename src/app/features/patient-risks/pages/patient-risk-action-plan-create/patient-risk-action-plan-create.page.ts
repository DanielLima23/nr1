import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { PatientRiskActionPlanService } from '../../services/patient-risk-action-plan.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-patient-risk-action-plan-create',
  standalone: true,
  templateUrl: './patient-risk-action-plan-create.page.html',
  styleUrls: ['./patient-risk-action-plan-create.page.scss'],
  imports: [CommonModule, TopPageComponent, ReactiveFormsModule, ButtonModule, RouterLink],
})
export class PatientRiskActionPlanCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(PatientRiskActionPlanService);
  override route = inject(ActivatedRoute);

  companyId = this.route.snapshot.queryParamMap.get('companyId') || '';
  patientId = this.route.snapshot.params['patientId'];
  riskId = this.route.snapshot.params['riskId'];
  actionPlanId = this.route.snapshot.params['actionPlanId'];
  submitted = false;
  backQueryParams = this.companyId ? { companyId: this.companyId } : null;
  backLink = ['/admin/pacientes', this.patientId, 'riscos', this.riskId, 'planos'];

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: [''],
    responsible: [''],
    completed: [false],
  });

  ngOnInit(): void {
    if (this.actionPlanId) {
      this.loadPlan();
    }
  }

  private loadPlan() {
    if (!this.companyId || !this.patientId || !this.riskId) return;
    this.service.getById(this.companyId, this.patientId, this.riskId, this.actionPlanId).subscribe({
      next: (plan) => {
        const { dueDate, ...rest } = plan || {};
        this.form.patchValue({
          ...rest,
          dueDate: dueDate ? dueDate.substring(0, 10) : '',
        });
      },
      error: () => this.toast.error('Erro ao carregar plano.'),
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid || !this.companyId || !this.patientId || !this.riskId) {
      this.form.markAllAsTouched();
      return;
    }

    const value = this.form.value;
    const payload: any = {
      title: value.title?.trim() || undefined,
      description: value.description?.trim() || undefined,
      responsible: value.responsible?.trim() || undefined,
      completed: !!value.completed,
      dueDate: value.dueDate ? new Date(value.dueDate).toISOString() : null,
    };

    const backLink = ['/admin/pacientes', this.patientId, 'riscos', this.riskId, 'planos'];

    if (this.actionPlanId) {
      this.service.update(this.companyId, this.patientId, this.riskId, this.actionPlanId, payload).subscribe({
        next: () => {
          this.toast.success('Plano atualizado com sucesso!');
          this.router.navigate(backLink, { queryParams: { companyId: this.companyId } });
        },
        error: () => this.toast.error('Erro ao atualizar plano.'),
      });
    } else {
      this.service.create(this.companyId, this.patientId, this.riskId, payload).subscribe({
        next: () => {
          this.toast.success('Plano criado com sucesso!');
          this.router.navigate(backLink, { queryParams: { companyId: this.companyId } });
        },
        error: () => this.toast.error('Erro ao criar plano.'),
      });
    }
  }
}
