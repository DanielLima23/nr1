// side-nav.component.ts
import { Component, Input, inject } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';

export interface SideNavItem {
  label: string;
  icon?: string;
  route?: string; // opcional para itens que são só grupo
  children?: SideNavItem[];
  requiredPermissions?: string[];
  requiredRoles?: string[];
}

@Component({
  selector: 'app-side-nav',
  standalone: true,
  imports: [RouterModule, CommonModule, ConfirmModalComponent],
  templateUrl: './side-nav.component.html',
  styleUrls: ['./side-nav.component.scss'],
})
export class SideNavComponent {
  @Input() items: SideNavItem[] = [];

  private auth = inject(AuthService);
  private router = inject(Router);

  // controla quais grupos estão expandidos
  expandedMap = new Map<string, boolean>();
  showLogoutConfirm = false;

  logout(): void {
    this.showLogoutConfirm = true;
  }

  confirmLogout(): void {
    this.showLogoutConfirm = false;
    this.auth.logout();
    this.router.navigate(['/auth/login']);
  }

  cancelLogout(): void {
    this.showLogoutConfirm = false;
  }

  onGroupClick(item: SideNavItem): void {
    if (!item.children?.length) {
      return;
    }
    const key = this.getItemKey(item);
    const current = this.expandedMap.get(key) ?? false;
    this.expandedMap.set(key, !current);
  }

  // usado para estilizar ativo (pai ou filho)
  isItemActive(item: SideNavItem): boolean {
    const url = this.router.url;

    if (item.route && url.startsWith(item.route)) {
      return true;
    }

    if (item.children?.length) {
      return item.children.some(child => this.isItemActive(child));
    }

    return false;
  }

  // usado para saber se o grupo está expandido
  isExpanded(item: SideNavItem): boolean {
    if (!item.children?.length) {
      return false;
    }

    const key = this.getItemKey(item);
    const manual = this.expandedMap.get(key);
    if (manual !== undefined) {
      return manual;
    }

    // se algum filho estiver ativo, mantém aberto
    return this.isItemActive(item);
  }

  private getItemKey(item: SideNavItem): string {
    // pode ajustar depois se quiser chavear por id
    return item.route || item.label;
  }
}
