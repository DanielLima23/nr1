import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import {
  DashboardCompany,
  DashboardService,
} from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-home',
  standalone: true,
  templateUrl: './dashboard-home.page.html',
  styleUrls: ['./dashboard-home.page.scss'],
  imports: [CommonModule, TopPageComponent, TableModule, ButtonModule],
})
export class DashboardHomePage extends BaseComponent implements OnInit {
  private service = inject(DashboardService);

  companies: DashboardCompany[] = [];
  totalCount = 0;
  page = 1;
  pageSize = 10;

  ngOnInit(): void {
    this.load();
  }

  load(page = this.page) {
    this.page = page;
    this.loading.set(true);
    this.service.getCompanies(this.page, this.pageSize).subscribe({
      next: (res) => {
        this.loading.set(false);
        this.companies = res?.items || [];
        this.totalCount = res?.totalCount || 0;
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
}
