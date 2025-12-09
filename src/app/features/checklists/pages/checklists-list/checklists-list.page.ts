import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { ChecklistService, Checklist } from '../../services/checklist.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-checklists-list',
  standalone: true,
  templateUrl: './checklists-list.page.html',
  styleUrls: ['./checklists-list.page.scss'],
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
export class ChecklistsListPage extends BaseComponent implements OnInit {
  service = inject(ChecklistService);
  list: Checklist[] = [];
  showConfirmModal = false;
  selectedId: string | null = null;
  selectedName = '';
  deletingId: string | null = null;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.loading.set(true);
    this.service.list().subscribe({
      next: (res) => {
        this.list = Array.isArray(res) ? res : [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar checklists.');
      },
    });
  }

  openDeleteConfirm(row: Checklist) {
    if (!row?.id) return;
    this.selectedId = row.id;
    this.selectedName = row.name ?? '';
    this.showConfirmModal = true;
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.selectedId = null;
    this.selectedName = '';
  }

  confirmDelete() {
    if (!this.selectedId) return;
    const idToRemove = this.selectedId;
    this.deletingId = idToRemove;
    this.showConfirmModal = false;

    this.service.deleteById(idToRemove).subscribe({
      next: () => {
        this.toast.success('Checklist removido com sucesso!');
        this.load();
        this.deletingId = null;
        this.selectedId = null;
        this.selectedName = '';
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover checklist.');
      },
    });
  }
}
