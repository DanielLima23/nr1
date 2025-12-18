import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { ChecklistItemService } from '../../services/checklist-item.service';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'app-checklist-items-create',
  standalone: true,
  templateUrl: './checklist-items-create.page.html',
  styleUrls: ['./checklist-items-create.page.scss'],
  imports: [CommonModule, TopPageComponent, ReactiveFormsModule, ButtonModule, RouterLink],
})
export class ChecklistItemsCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private service = inject(ChecklistItemService);

  checklistId = this.route.snapshot.params['checklistId'];
  itemId = this.route.snapshot.params['itemId'];
  submitted = false;
  pageTitle = 'Novo item';

  form = this.fb.group({
    question: ['', Validators.required],
    order: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.checklistId && this.itemId) {
      this.service.getById(this.checklistId, this.itemId).subscribe({
        next: (data) => {
          this.form.patchValue({ question: data.question, order: data.order });
          this.pageTitle = `Editar item ${data?.question ?? ''}`.trim();
        },
        error: () => this.toast.error('Erro ao carregar item.'),
      });
    } else {
      this.pageTitle = 'Novo item';
    }
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid || !this.checklistId) {
      this.form.markAllAsTouched();
      return;
    }

    const payload = {
      question: this.form.value.question?.trim(),
      order: Number(this.form.value.order ?? 0),
    };

    if (this.itemId) {
      this.service.update(this.checklistId, this.itemId, payload).subscribe({
        next: () => {
          this.toast.success('Item atualizado com sucesso!');
          this.navigate(['/admin/checklists', this.checklistId, 'itens']);
        },
        error: () => this.toast.error('Erro ao atualizar item.'),
      });
    } else {
      this.service.create(this.checklistId, payload).subscribe({
        next: () => {
          this.toast.success('Item criado com sucesso!');
          this.navigate(['/admin/checklists', this.checklistId, 'itens']);
        },
        error: () => this.toast.error('Erro ao criar item.'),
      });
    }
  }
}
