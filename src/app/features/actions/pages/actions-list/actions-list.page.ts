import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AsyncPipe, DatePipe } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TableModule } from 'primeng/table';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { ActionPlanService } from '../../services/action-plan.service';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-actions-list',
  standalone: true,
  templateUrl: './actions-list.page.html',
  styleUrls: ['./actions-list.page.scss'],
  imports: [
    TopPageComponent,
    RouterLink,
    TableModule,
    ButtonModule,
    TooltipModule,
    AsyncPipe,
    DatePipe,
    ConfirmModalComponent,
  ],
})
export class ActionsListPage extends BaseComponent implements OnInit {
  riskId: string | null = this.route.snapshot.params['riskId'] ?? null;
  service = inject(ActionPlanService);
  actions$ = this.service.actions$;
  backLink = '/admin/riscos';
  createLink = this.riskId
    ? ['/admin/riscos', this.riskId, 'acoes', 'criar']
    : '/admin/riscos';

  showConfirmModal = false;
  selectedId: string | null = null;
  selectedTitle = '';
  deletingId: string | null = null;

  constructor() { super(); }

  ngOnInit(): void {
    this.load();
  }

  private load() {
    if (!this.riskId) return;
    this.loading.set(true);

    this.service.loadAll(this.riskId).subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar planos de ação.');
      },
    });
  }

  openDeleteConfirm(row: any) {
    this.selectedId = row?.id ?? null;
    this.selectedTitle = row?.title ?? '';
    this.showConfirmModal = true;
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.selectedId = null;
    this.selectedTitle = '';
  }

  confirmDelete() {
    if (!this.riskId || !this.selectedId) return;
    const idToRemove = this.selectedId;
    this.deletingId = idToRemove;
    this.showConfirmModal = false;

    this.service.deleteById(this.riskId, idToRemove).subscribe({
      next: () => {
        this.toast.success('Plano de ação removido com sucesso!');
        this.deletingId = null;
        this.selectedId = null;
        this.selectedTitle = '';
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover plano de ação.');
      },
    });
  }
}
