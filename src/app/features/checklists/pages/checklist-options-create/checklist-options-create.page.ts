import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { ChecklistOptionService } from '../../services/checklist-option.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-checklist-options-create',
  standalone: true,
  templateUrl: './checklist-options-create.page.html',
  styleUrls: ['./checklist-options-create.page.scss'],
  imports: [CommonModule, TopPageComponent, ReactiveFormsModule, ButtonModule, RouterLink],
})
export class ChecklistOptionsCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ChecklistOptionService);

  checklistId = this.route.snapshot.params['checklistId'];
  itemId = this.route.snapshot.params['itemId'];
  optionId = this.route.snapshot.params['optionId'];
  submitted = false;

  form = this.fb.group({
    label: ['', Validators.required],
    requireExplanation: [false],
    order: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.checklistId && this.itemId && this.optionId) {
      this.service.getById(this.checklistId, this.itemId, this.optionId).subscribe({
        next: (data) =>
          this.form.patchValue({
            label: data.label,
            requireExplanation: data.requireExplanation,
            order: data.order,
          }),
        error: () => this.toast.error('Erro ao carregar opcao.'),
      });
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid || !this.checklistId || !this.itemId) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      label: this.form.value.label?.trim(),
      requireExplanation: !!this.form.value.requireExplanation,
      order: Number(this.form.value.order ?? 0),
    };

    const listLink = ['/admin/checklists', this.checklistId, 'itens', this.itemId, 'opcoes'];

    if (this.optionId) {
      this.service.update(this.checklistId, this.itemId, this.optionId, payload).subscribe({
        next: () => {
          this.toast.success('Opcao atualizada com sucesso!');
          this.navigate(listLink);
        },
        error: () => this.toast.error('Erro ao atualizar opcao.'),
      });
    } else {
      this.service.create(this.checklistId, this.itemId, payload).subscribe({
        next: () => {
          this.toast.success('Opcao criada com sucesso!');
          this.navigate(listLink);
        },
        error: () => this.toast.error('Erro ao criar opcao.'),
      });
    }
  }
}
