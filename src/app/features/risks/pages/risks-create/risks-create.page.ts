import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { RiskService, Risk } from '../../services/risk.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-risks-create',
  standalone: true,
  templateUrl: './risks-create.page.html',
  styleUrls: ['./risks-create.page.scss'],
  imports: [CommonModule, TopPageComponent, ReactiveFormsModule, ButtonModule, RouterLink],
})
export class RisksCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(RiskService);
  riskId: string | null = this.normalizeId(this.id());
  submitted = false;
  pageTitle = 'Novo risco';

  form = this.fb.group({
    title: ['', Validators.required],
    description: [''],
    probability: [0, [Validators.required, Validators.min(0)]],
    impact: [0, [Validators.required, Validators.min(0)]],
    mitigation: [''],
    active: [true],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.riskId) {
      this.service.getById(this.riskId).subscribe({
        next: (risk) => {
          this.form.patchValue(risk);
          this.pageTitle = `Editar risco ${risk?.title ?? ''}`.trim();
        },
        error: () => this.toast.error('Erro ao carregar risco.'),
      });
    } else {
      this.pageTitle = 'Novo risco';
    }
  }

  private normalizeId(id: string | null): string | null {
    if (!id) return null;
    const normalized = id.toLowerCase();
    return normalized === 'create' || normalized === 'criar' ? null : id;
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const formValue = this.form.value;
    const prob = Number(formValue.probability);
    const imp = Number(formValue.impact);

    const payload: Partial<Risk> = {
      title: formValue.title?.trim() || undefined,
      description: formValue.description?.trim() || undefined,
      probability: Number.isFinite(prob) ? prob : undefined,
      impact: Number.isFinite(imp) ? imp : undefined,
      mitigation: formValue.mitigation?.trim() || undefined,
      active: !!formValue.active,
    };

    if (this.riskId) {
      this.service.update(this.riskId, payload).subscribe({
        next: () => {
          this.toast.success('Risco atualizado com sucesso!');
          this.navigate('/admin/riscos');
        },
        error: () => this.toast.error('Erro ao atualizar risco.'),
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.toast.success('Risco criado com sucesso!');
          this.navigate('/admin/riscos');
        },
        error: () => this.toast.error('Erro ao criar risco.'),
      });
    }
  }
}
