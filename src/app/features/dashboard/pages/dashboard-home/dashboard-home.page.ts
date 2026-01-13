import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import {
  DashboardCompany,
  DashboardService,
} from '../../services/dashboard.service';
import { LocalStorageService } from '../../../../core/services/local-storage.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  templateUrl: './dashboard-home.page.html',
  styleUrls: ['./dashboard-home.page.scss'],
  imports: [CommonModule, TopPageComponent, TableModule, ButtonModule, TooltipModule],
})
export class DashboardHomePage extends BaseComponent implements OnInit {
  private service = inject(DashboardService);
  private storage = inject(LocalStorageService);

  companies: DashboardCompany[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 10;
  showReportMenu = false;
  isDownloadingReport = false;

  ngOnInit(): void {
    this.load();
  }

  load(page = 1) {
    this.page = page || 1;
    this.loading.set(true);
    this.service.getCompanies(this.page).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.companies = res?.items || [];
        const fallbackLength = this.companies.length || 0;
        this.totalCount = res?.totalCount ?? fallbackLength;
        const fallbackPageSize = this.companies.length || this.pageSize;
        this.pageSize = res?.pageSize ?? fallbackPageSize;
      },
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar dashboard.');
      },
    });
  }

  progressLabel(item: DashboardCompany) {
    return `${item.completedPlans}/${item.totalPlans} planos`;
  }

  totalPlans(): number {
    return this.companies.reduce((acc, item) => acc + (item.totalPlans || 0), 0);
  }

  completedPlans(): number {
    return this.companies.reduce(
      (acc, item) => acc + (item.completedPlans || 0),
      0
    );
  }

  overallProgress(): number {
    const total = this.totalPlans();
    const completed = this.completedPlans();
    return total > 0 ? Math.round((completed / total) * 100) : 0;
  }

  toggleReportMenu() {
    this.showReportMenu = !this.showReportMenu;
  }

  downloadReport(format: 'pdf' | 'text') {
    const companyId = this.resolveReportCompanyId();
    if (!companyId || this.isDownloadingReport) {
      return;
    }

    this.isDownloadingReport = true;
    this.service.downloadSectorActionPlansReport(companyId, format).subscribe({
      next: (blob: Blob) => {
        this.isDownloadingReport = false;
        this.showReportMenu = false;
        this.triggerDownload(blob, format, companyId);
      },
      error: () => {
        this.isDownloadingReport = false;
        this.toast.error('Erro ao gerar relatorio.');
      },
    });
  }

  private resolveReportCompanyId(): string | null {
    const auth = this.storage.getObject('auth_data');
    const rawId =
      auth?.user?.companyId ??
      auth?.user?.company_id ??
      auth?.user?.empresaId ??
      auth?.user?.empresa_id ??
      auth?.user?.company?.id;
    const normalized = rawId?.toString?.() ?? rawId;
    if (normalized) return normalized;

    const fallbackId = this.companies?.[0]?.companyId;
    if (fallbackId) {
      if ((this.companies || []).length > 1) {
        this.toast.warn('Mais de uma empresa encontrada. Usando a primeira.');
      }
      return fallbackId;
    }

    this.toast.warn('Nenhuma empresa encontrada para gerar o relatorio.');
    return null;
  }

  private triggerDownload(blob: Blob, format: 'pdf' | 'text', companyId: string) {
    const ext = format === 'pdf' ? 'pdf' : 'txt';
    const date = new Date().toISOString().slice(0, 10);
    const filename = `relatorio-setorial-${companyId}-${date}.${ext}`;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  }
}
