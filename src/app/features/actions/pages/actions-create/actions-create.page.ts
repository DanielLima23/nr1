import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { ActionPlanService } from '../../services/action-plan.service';

@Component({
  selector: 'app-actions-create',
  standalone: true,
  templateUrl: './actions-create.page.html',
  styleUrls: ['./actions-create.page.scss'],
  imports: [CommonModule, TopPageComponent, ReactiveFormsModule, ButtonModule, RouterLink],
})
export class ActionsCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ActionPlanService);
  planId = this.route.snapshot.params['id'] ?? null;
  riskId = this.route.snapshot.params['riskId'] ?? null;
  actionsListLink = this.riskId
    ? ['/admin/riscos', this.riskId, 'acoes']
    : '/admin/riscos';
  submitted = false;

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    dueDate: [''],
    responsible: [''],
    completed: [false],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.riskId && this.planId) {
      this.service.getById(this.riskId, this.planId).subscribe({
        next: (plan) => {
          const { dueDate, ...rest } = plan || {};
          this.form.patchValue({
            ...rest,
            dueDate: dueDate ? dueDate.substring(0, 10) : '',
          });
        },
        error: () => this.toast.error('Erro ao carregar plano de acao.'),
      });
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit() {
    this.submitted = true;
    if (!this.riskId || this.form.invalid) {
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

    if (this.planId) {
      this.service.update(this.riskId, this.planId, payload).subscribe({
        next: () => {
          this.toast.success('Plano de acao atualizado com sucesso!');
          this.navigate(this.actionsListLink);
        },
        error: () => this.toast.error('Erro ao atualizar plano de acao.'),
      });
    } else {
      this.service.create(this.riskId, payload).subscribe({
        next: () => {
          this.toast.success('Plano de acao criado com sucesso!');
          this.navigate(this.actionsListLink);
        },
        error: () => this.toast.error('Erro ao criar plano de acao.'),
      });
    }
  }
}
