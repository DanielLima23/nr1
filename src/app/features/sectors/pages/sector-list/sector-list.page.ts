import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { SectorService, Sector } from '../../services/sector.service';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';

@Component({
  selector: 'app-sector-list',
  standalone: true,
  imports: [TopPageComponent, RouterModule, TableModule, ButtonModule, AsyncPipe, ConfirmModalComponent],
  templateUrl: './sector-list.page.html',
  styleUrls: ['./sector-list.page.scss'],
})
export class SectorListPage extends BaseComponent implements OnInit {
  service = inject(SectorService);

  companyId!: string;
  sectors: Sector[] = [];
  showConfirmModal = false;
  selectedId: string | number | null = null;
  selectedName = '';
  deletingId: string | number | null = null;

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.list(this.companyId).subscribe({
      next: (res) => {
        this.sectors = res ?? [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar setores.');
      },
    });
  }

  openDeleteConfirm(row: any) {
    this.selectedId = row?.id ?? null;
    this.selectedName = row?.name ?? '';
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

    this.service.deleteById(this.companyId, idToRemove).subscribe({
      next: () => {
        this.toast.success('Setor removido com sucesso!');
        this.load();
        this.deletingId = null;
        this.selectedId = null;
        this.selectedName = '';
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover setor.');
      },
    });
  }
}
