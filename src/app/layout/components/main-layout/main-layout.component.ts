import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { SideNavComponent, SideNavItem } from '../side-nav/side-nav.component';
import { ToastModule } from 'primeng/toast';
import { LocalStorageService } from '../../../core/services/local-storage.service';
import { BreadcrumbComponent, Crumb } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { filter, Subscription } from 'rxjs';
import { PERMISSIONS } from '../../../shared/classes/tipo-permissaso';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SideNavComponent, ToastModule, BreadcrumbComponent],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit, OnDestroy {

  private storage = inject(LocalStorageService);
  private router = inject(Router);
  private navigationSub?: Subscription;
  userRole = '';
  private userRoleNormalized = '';

  items: SideNavItem[] = [];

  userName = '';
  crumbs: Crumb[] = [{ label: 'Dashboard', link: '/admin/dashboard', icon: 'pi pi-home' }];

  ngOnInit(): void {
    const auth = this.storage.getObject('auth_data');
    const user = auth?.user;

    this.userName = user?.given_name || '';
    this.userRole = user?.role || '';
    this.userRoleNormalized = (this.userRole || '').toString().toLowerCase();
    this.buildMenu();

    this.updateCrumbs(this.router.url);
    this.navigationSub = this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe((e: any) => this.updateCrumbs(e.urlAfterRedirects || e.url));
  }

  ngOnDestroy(): void {
    this.navigationSub?.unsubscribe();
  }

  private updateCrumbs(url: string) {
    const base: Crumb[] = [{ label: 'Dashboard', link: '/admin/dashboard', icon: 'pi pi-home' }];
    const cleanUrl = url.split('?')[0] || '';
    const parts = cleanUrl.split('/').filter(Boolean);
    const startIndex = parts[0] === 'admin' ? 1 : 0;
    const segments = parts.slice(startIndex);

    const crumbs: Crumb[] = [...base];
    let acc: string[] = parts.slice(0, startIndex);

    segments.forEach((seg) => {
      // evita duplicar dashboard/dashboard
      if (seg === 'dashboard' && segments.length === 1) return;
      acc.push(seg);
      if (this.isIdSegment(seg)) return;
      const link = '/' + acc.join('/');
      crumbs.push({
        label: this.formatLabel(seg),
        link,
      });
    });

    this.crumbs = crumbs;
  }

  private isIdSegment(seg: string): boolean {
    return /^[0-9a-fA-F-]{8,}$/.test(seg) || /^\d+$/.test(seg);
  }

  private formatLabel(seg: string): string {
    const spaced = seg.replace(/-/g, ' ');
    const normalized = spaced.toLowerCase();
    if (normalized === 'pacientes' || normalized === 'paciente') return 'Trabalhador(a)';
    return spaced.charAt(0).toUpperCase() + spaced.slice(1);
  }

  get initials(): string {
    if (!this.userName) return '--';
    const parts = this.userName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const last = parts.length > 1 ? parts[parts.length - 1][0] : '';
    const pair = (first + last).toUpperCase();
    return pair || first.toUpperCase() || '--';
  }

  private buildMenu() {
    const admin = PERMISSIONS.ADMINISTRADOR.toLowerCase();
    const medico = PERMISSIONS.MEDICO.toLowerCase();
    const engenheiro = PERMISSIONS.ENGENHEIRO.toLowerCase();
    const empresa = PERMISSIONS.EMPRESA.toLowerCase();

    const dashboard: SideNavItem = {
      label: 'Dashboard',
      icon: 'pi-home',
      route: '/admin/dashboard',
      requiredRoles: [admin, medico, engenheiro],
    };

    const medidasSetor: SideNavItem = {
      label: 'Medidas por Setor',
      icon: 'pi-sitemap',
      route: '/admin/medidas-metigadoras-empresa',
      requiredRoles: [admin, engenheiro, empresa],
    };

    const cadastrosChildren: SideNavItem[] = [
      { label: 'Usuarios', icon: 'pi-users', route: '/admin/usuarios', requiredRoles: [admin] },
      { label: 'Empresa', icon: 'pi-briefcase', route: '/admin/empresa', requiredRoles: [admin, engenheiro] },
      { label: 'Riscos', icon: 'pi-exclamation-triangle', route: '/admin/riscos', requiredRoles: [admin, engenheiro] },
      { label: 'Trabalhador(a)', icon: 'pi-id-card', route: '/admin/pacientes', requiredRoles: [admin, medico, engenheiro] },
      { label: 'Checklists', icon: 'pi-clipboard', route: '/admin/checklists', requiredRoles: [admin, engenheiro] },
    ];

    if (this.userRoleNormalized === empresa) {
      this.items = [dashboard, medidasSetor].filter((i) => i.requiredRoles?.includes(empresa));
      return;
    }

    if (this.userRoleNormalized === medico) {
      this.items = [
        dashboard,
        {
          label: 'Trabalhador(a)',
          icon: 'pi-id-card',
          route: '/admin/pacientes',
          requiredRoles: [medico, admin, engenheiro],
        },
      ];
      return;
    }

    this.items = [
      dashboard,
      medidasSetor,
      {
        label: 'Cadastros',
        icon: 'pi-database',
        children: cadastrosChildren,
        requiredRoles: [admin, medico, engenheiro],
      },
    ];
  }
}
