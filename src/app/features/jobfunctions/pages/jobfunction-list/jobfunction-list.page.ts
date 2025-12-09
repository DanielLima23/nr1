import { AsyncPipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import {
  JobFunctionService,
  JobFunction,
} from '../../services/jobfunction.service';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';

@Component({
  selector: 'app-jobfunction-list',
  standalone: true,
  imports: [TopPageComponent, RouterModule, TableModule, ButtonModule, AsyncPipe],
  templateUrl: './jobfunction-list.page.html',
  styleUrls: ['./jobfunction-list.page.scss'],
})
export class JobFunctionListPage extends BaseComponent implements OnInit {
  service = inject(JobFunctionService);

  companyId!: string;
  sectorId!: string;
  jobFunctions: JobFunction[] = [];
  showConfirmModal = false;
  selectedId: string | number | null = null;
  selectedName = '';
  deletingId: string | number | null = null;

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.sectorId = this.route.snapshot.params['sectorId'];
    this.load();
  }

  load() {
    this.loading.set(true);
    this.service.list(this.companyId, this.sectorId).subscribe({
      next: (res) => {
        this.jobFunctions = res ?? [];
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar funções.');
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

    this.service.deleteById(this.companyId, this.sectorId, idToRemove).subscribe({
      next: () => {
        this.toast.success('Função removida com sucesso!');
        this.load();
        this.deletingId = null;
        this.selectedId = null;
        this.selectedName = '';
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover função.');
      },
    });
  }
}
