import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { switchMap } from 'rxjs';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { UsersService } from '../../services/user.service';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';

@Component({
  selector: 'app-users-create',
  standalone: true,
  templateUrl: './users-create.page.html',
  styleUrls: ['./users-create.page.scss'],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    DropdownModule,
    ButtonModule,
    TopPageComponent,
  ],
})
export class UsersCreatePage extends BaseComponent implements OnInit {
  fb = inject(FormBuilder);
  service = inject(UsersService);

  userId: string | null = null;
  pageTitle = 'Novo usuario';
  profiles: any[] = [];
  submitted = false;

  form = this.fb.group({
    name: ['', Validators.required],
    username: ['', Validators.required],
    password: [''],
    newPassword: [''],
    profile: [null as any, Validators.required],
    active: [true],
  });

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      const paramId = params.get('id');
      const normalizedId =
        paramId && paramId !== 'criar' && paramId !== 'create' ? paramId : null;

      this.userId = normalizedId;
      this.pageTitle = this.userId ? 'Editar usuario' : 'Novo usuario';

      if (this.userId) {
        this.form.get('username')?.disable();
        this.setPasswordValidators(false);
        this.loadUserAndProfiles();
        return;
      }

      this.form.reset({
        name: '',
        username: '',
        password: '',
        newPassword: '',
        profile: null,
        active: true,
      });

      this.form.get('username')?.enable();
      this.setPasswordValidators(true);
      this.loadProfiles();
    });
  }

  private setPasswordValidators(required: boolean) {
    const control = this.form.get('password');
    if (!control) return;
    control.clearValidators();
    if (required) control.addValidators(Validators.required);
    control.updateValueAndValidity({ emitEvent: false });
  }

  private loadUserAndProfiles() {
    this.service
      .getById(this.userId)
      .pipe(
        switchMap((user: any) => {
          this.form.patchValue({
            name: user.name,
            username: user.username,
            active: user.active,
          });
          this.pageTitle = `Editar usuario ${user.name || ''}`.trim();

          const profileId = String(user.profile);

          return this.service.loadProfiles().pipe(
            switchMap((profiles: any) => {
              this.profiles = profiles.map((p: any) => ({
                label: p.name,
                value: String(p.id),
              }));

              this.form.patchValue({ profile: profileId });
              return [];
            })
          );
        })
      )
      .subscribe({
        error: () => this.toast.error('Erro ao carregar usuario.'),
      });
  }

  private loadProfiles() {
    this.service.loadProfiles().subscribe({
      next: (list: any) => {
        this.profiles = list.map((p: any) => ({
          label: p.name,
          value: String(p.id),
        }));
      },
      error: () => this.toast.error('Erro ao carregar perfis.'),
    });
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body: any = this.form.getRawValue();
    body.profile = Number(body.profile);

    if (this.userId) {
      delete body.password;
      if (!body.newPassword) delete body.newPassword;
      this.update(body);
      return;
    }

    this.create(body);
  }

  private create(body: any) {
    this.service.create(body).subscribe({
      next: () => {
        this.toast.success('Usuario criado com sucesso!');
        this.navigate('/admin/usuarios');
      },
      error: () => this.toast.error('Erro ao criar usuario.'),
    });
  }

  private update(body: any) {
    this.service.update(this.userId, body).subscribe({
      next: () => {
        this.toast.success('Usuario atualizado com sucesso!');
        this.navigate('/admin/usuarios');
      },
      error: () => this.toast.error('Erro ao atualizar usuario.'),
    });
  }
}
