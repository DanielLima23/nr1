import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastService } from '../../../../shared/services/toast.service';
import { environment } from '../../../../../environments/environment';
import { ToastModule } from 'primeng/toast';
import { LoginService } from './login.service';

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ToastModule],
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private loginService = inject(LoginService);
  private router = inject(Router);
  private toast = inject(ToastService);

  showPassword = false;
  showWelcome = false;

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required]],
    password: ['', Validators.required],
  });

  get username() {
    return this.form.controls['username'];
  }

  get password() {
    return this.form.controls['password'];
  }

  isMockEnabled = environment.useMockAuth;

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();

      // Mensagens específicas para cada campo
      if (this.username.invalid) {
        this.toast.warn('Digite um e-mail válido.');
      } else if (this.password.invalid) {
        this.toast.warn('Digite sua senha.');
      } else {
        this.toast.warn('Preencha todos os campos corretamente.');
      }

      return;
    }

    const { username, password } = this.form.getRawValue();

    this.loginService.login({ username, password }).subscribe({
      next: () => {
        this.showWelcome = true;
        setTimeout(() => this.router.navigate(['/admin/dashboard']), 1200);
      },
      error: (err) => {
        this.toast.error(
          err?.error?.message || 'Erro ao fazer login.',
          'Erro'
        );
      },
    });
  }

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  loginAsDev(): void {
    this.form.setValue({
      username: 'dev@local.test',
      password: '123456',
    });

    this.submit();
  }
}
