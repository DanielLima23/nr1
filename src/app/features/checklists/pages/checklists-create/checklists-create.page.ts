import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { ChecklistService } from '../../services/checklist.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checklists-create',
  standalone: true,
  templateUrl: './checklists-create.page.html',
  styleUrls: ['./checklists-create.page.scss'],
  imports: [CommonModule, TopPageComponent, ReactiveFormsModule, ButtonModule, RouterLink],
})
export class ChecklistsCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ChecklistService);

  checklistId: string | null = this.normalizeId(this.id());
  submitted = false;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.checklistId) {
      this.service.getById(this.checklistId).subscribe({
        next: (data) => this.form.patchValue(data),
        error: () => this.toast.error('Erro ao carregar checklist.'),
      });
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

    const payload = {
      name: this.form.value.name?.trim(),
      description: this.form.value.description?.trim() || undefined,
    };

    if (this.checklistId) {
      this.service.update(this.checklistId, payload).subscribe({
        next: () => {
          this.toast.success('Checklist atualizado com sucesso!');
          this.navigate('/admin/checklists');
        },
        error: () => this.toast.error('Erro ao atualizar checklist.'),
      });
    } else {
      this.service.create(payload).subscribe({
        next: () => {
          this.toast.success('Checklist criado com sucesso!');
          this.navigate('/admin/checklists');
        },
        error: () => this.toast.error('Erro ao criar checklist.'),
      });
    }
  }
}
