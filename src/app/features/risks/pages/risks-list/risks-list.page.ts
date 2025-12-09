import { Component, OnInit, inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { RiskService, Risk } from '../../services/risk.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-risks-list',
  standalone: true,
  templateUrl: './risks-list.page.html',
  styleUrls: ['./risks-list.page.scss'],
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
export class RisksListPage extends BaseComponent implements OnInit {
  service = inject(RiskService);
  risks$ = this.service.risks$;
  showConfirmModal = false;
  selectedId: string | null = null;
  selectedTitle = '';
  deletingId: string | null = null;
  confirmLoading = false;

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.load();
  }

  private load() {
    this.loading.set(true);

    this.service.loadAll().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar riscos.');
      },
    });
  }

  openDeleteConfirm(row: any) {
    this.selectedId = row?.id ?? null;
    this.selectedTitle = row?.title ?? '';
    this.showConfirmModal = true;
    this.confirmLoading = false;
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.selectedId = null;
    this.selectedTitle = '';
    this.confirmLoading = false;
  }

  confirmDelete() {
    if (!this.selectedId) return;
    const idToRemove = this.selectedId;
    this.deletingId = idToRemove;
    this.confirmLoading = true;

    this.service.deleteById(idToRemove).subscribe({
      next: () => {
        this.toast.success('Risco removido com sucesso!');
        this.deletingId = null;
        this.selectedId = null;
        this.selectedTitle = '';
      },
      error: () => {
        this.deletingId = null;
        this.confirmLoading = false;
        this.toast.error('Erro ao remover risco.');
      },
    });
  }
}
