import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { ChecklistOptionService, ChecklistOptionResponse } from '../../services/checklist-option.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-checklist-options-list',
  standalone: true,
  templateUrl: './checklist-options-list.page.html',
  styleUrls: ['./checklist-options-list.page.scss'],
  imports: [
    TopPageComponent,
    RouterLink,
    TableModule,
    ButtonModule,
    TooltipModule,
    AsyncPipe,
    ConfirmModalComponent,
  ],
})
export class ChecklistOptionsListPage extends BaseComponent implements OnInit {
  service = inject(ChecklistOptionService);

  checklistId = this.route.snapshot.params['checklistId'];
  itemId = this.route.snapshot.params['itemId'];

  options: ChecklistOptionResponse[] = [];
  showConfirmModal = false;
  selectedId: string | null = null;
  selectedLabel = '';
  deletingId: string | null = null;

  backLink = ['/admin/checklists', this.checklistId, 'itens'];
  createLink = ['/admin/checklists', this.checklistId, 'itens', this.itemId, 'opcoes', 'criar'];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.load();
  }

  private load() {
    if (!this.checklistId || !this.itemId) return;
    this.loading.set(true);
    this.service.list(this.checklistId, this.itemId).subscribe({
      next: (res) => {
        this.options = Array.isArray(res) ? res : [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar opções.');
      },
    });
  }

  openDeleteConfirm(row: ChecklistOptionResponse) {
    if (!row?.id) return;
    this.selectedId = row.id;
    this.selectedLabel = row.label ?? '';
    this.showConfirmModal = true;
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.selectedId = null;
    this.selectedLabel = '';
  }

  confirmDelete() {
    if (!this.checklistId || !this.itemId || !this.selectedId) return;
    const idToRemove = this.selectedId;
    this.deletingId = idToRemove;
    this.showConfirmModal = false;

    this.service.deleteById(this.checklistId, this.itemId, idToRemove).subscribe({
      next: () => {
        this.toast.success('Opção removida com sucesso!');
        this.load();
        this.deletingId = null;
        this.selectedId = null;
        this.selectedLabel = '';
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover opção.');
      },
    });
  }
}
