import { Component, OnInit, inject } from '@angular/core';
import { UsersService } from '../../services/user.service';
import { RouterLink } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-users-list',
  standalone: true,
  templateUrl: './users-list.page.html',
  styleUrls: ['./users-list.page.scss'],
  imports: [
    TopPageComponent,
    RouterLink,
    TableModule,
    ButtonModule,
    TooltipModule,
    AsyncPipe
  ],
})
export class UsersListPage extends BaseComponent implements OnInit {
  service = inject(UsersService);
  users$ = this.service.users$;

  profilesMap: any = {};
  showConfirmModal = false;
  selectedUserId: string | number | null = null;
  selectedUserName = '';
  deletingId: string | number | null = null;

  constructor() {
    super();
  }

  ngOnInit() {
    this.loadProfiles();
    this.load();
  }

  private loadProfiles() {
    this.service.loadProfiles().subscribe(list => {
      list = list || [];

      this.profilesMap = list.reduce((acc: any, p: any) => {
        acc[p.id] = p.name;
        return acc;
      }, {});
    });
  }

  private load() {
    this.loading.set(true);

    this.service.loadUsers().subscribe({
      next: () => this.loading.set(false),
      error: () => {
        this.loading.set(false);
        this.toast.error('Erro ao carregar usuários.');
      }
    });
  }

  openDeleteConfirm(user: any) {
    this.selectedUserId = user?.id ?? null;
    this.selectedUserName = user?.name ?? '';
    this.showConfirmModal = true;
  }

  closeDeleteConfirm() {
    this.showConfirmModal = false;
    this.selectedUserId = null;
    this.selectedUserName = '';
  }

  confirmDelete() {
    if (!this.selectedUserId) {
      return;
    }

    const idToRemove = this.selectedUserId;
    this.deletingId = idToRemove;
    this.showConfirmModal = false;

    this.service.deleteById(idToRemove).subscribe({
      next: () => {
        this.toast.success('Usuário removido com sucesso!');
        setTimeout(() => {
          this.deletingId = null;
          this.selectedUserId = null;
          this.selectedUserName = '';
        }, 250);
      },
      error: () => {
        this.deletingId = null;
        this.toast.error('Erro ao remover usuário.');
      }
    });
  }
}
