import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { ChecklistItemService, ChecklistItemResponse } from '../../services/checklist-item.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-checklist-items-list',
  standalone: true,
  templateUrl: './checklist-items-list.page.html',
  styleUrls: ['./checklist-items-list.page.scss'],
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
export class ChecklistItemsListPage extends BaseComponent implements OnInit {
  service = inject(ChecklistItemService);

  checklistId = this.route.snapshot.params['checklistId'];
  items: ChecklistItemResponse[] = [];
  showConfirmModal = false;
  selectedId: string | null = null;
  selectedLabel = '';
  deletingId: string | null = null;

  backLink = '/admin/checklists';
  createLink = ['/admin/checklists', this.checklistId, 'itens', 'criar'];

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.load();
  }

  private load() {
    if (!this.checklistId) return;
    this.loading.set(true);

    this.service.list(this.checklistId).subscribe({
      next: (res) => {
        this.items = Array.isArray(res) ? res : [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar itens.');
      },
    });
  }

  openDeleteConfirm(row: ChecklistItemResponse) {
    if (!row?.id) return;
    this.selectedId = row.id;
    this.selectedLabel = row.question ?? '';
    this.showConfirmModal = true;
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.selectedId = null;
    this.selectedLabel = '';
  }

  confirmDelete() {
    if (!this.checklistId || !this.selectedId) return;
    const idToRemove = this.selectedId;
    this.deletingId = idToRemove;
    this.showConfirmModal = false;

    this.service.deleteById(this.checklistId, idToRemove).subscribe({
      next: () => {
        this.toast.success('Item removido com sucesso!');
        this.load();
        this.deletingId = null;
        this.selectedId = null;
        this.selectedLabel = '';
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover item.');
      },
    });
  }
}
