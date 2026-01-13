import { AsyncPipe, DatePipe } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { EmpresaService } from '../../services/empresa.service';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { ConfirmModalComponent } from '../../../../shared/components/confirm-modal/confirm-modal.component';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { PERMISSIONS } from '../../../../shared/classes/tipo-permissaso';

@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [TopPageComponent, RouterLink, TableModule, ButtonModule, AsyncPipe, DatePipe, ConfirmModalComponent],
  templateUrl: './empresa-list.page.html',
  styleUrls: ['./empresa-list.page.scss'],
})
export class EmpresaListPage extends BaseComponent implements OnInit {
  service = inject(EmpresaService);
  private storage = inject(LocalStorageService);
  companies$ = this.service.companies$;
  showConfirmModal = false;
  selectedId: string | number | null = null;
  selectedName = '';
  deletingId: string | number | null = null;
  private isCompanyUser = false;
  private companyId: string | null = null;

  ngOnInit(): void {
    const auth = this.storage.getObject('auth_data');
    const user = auth?.user;
    this.isCompanyUser = this.isEmpresaRole(user?.role);
    this.companyId = this.resolveCompanyId(user);
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    if (this.isCompanyUser) {
      if (!this.companyId) {
        this.loading.set(false);
        this.service.setCompanies([]);
        this.toast.warn('Nenhuma empresa vinculada ao usuario.');
        return;
      }

      this.service.loadCompanyById(this.companyId).subscribe({
        next: () => this.loading.set(false),
        error: () => {
          this.loading.set(false);
          this.toast.error('Erro ao carregar empresa.');
        },
      });
      return;
    }

    this.service.loadCompanies().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar empresas.');
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

    this.service.deleteById(idToRemove).subscribe({
      next: () => {
        this.toast.success('Empresa removida com sucesso!');
        this.load();
        this.resetDeleteState();
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover empresa.');
      },
    });
  }

  private resetDeleteState() {
    this.deletingId = null;
    this.selectedId = null;
    this.selectedName = '';
  }

  private isEmpresaRole(role: any): boolean {
    return (role || '').toString().toLowerCase() === PERMISSIONS.EMPRESA.toLowerCase();
  }

  private resolveCompanyId(user: any): string | null {
    const rawId =
      user?.companyId ??
      user?.company_id ??
      user?.empresaId ??
      user?.empresa_id ??
      user?.company?.id ??
      user?.company?.companyId;
    const normalized = rawId?.toString?.() ?? rawId;
    return normalized || null;
  }
}
