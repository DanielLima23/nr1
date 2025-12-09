import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="forbidden-wrapper">

      <div class="forbidden-card">

        <div class="icon-circle animate-icon">
          <i class="pi pi-lock"></i>
        </div>

        <h1 class="animate-title">Acesso negado</h1>

        <p class="animate-text">
          Você não possui permissão para acessar esta área do sistema.
        </p>

        <button routerLink="/admin/dashboard" class="primary-button animate-button">
          Voltar ao Dashboard
        </button>

      </div>

    </div>
  `,
  styles: [`
    /* Contêiner respeitando o layout do pai */
    .forbidden-wrapper {
      width: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 40px 20px;
      animation: fadeIn 0.5s ease;
    }

    /* Card central */
    .forbidden-card {
      width: 100%;
      max-width: 420px;
      background: #ffffff;
      padding: 36px 32px;
      border-radius: 16px;
      box-shadow: 0 6px 26px rgba(0, 0, 0, 0.08);
      text-align: center;
      justify-content:center;
    }

    /* Ícone */
    .icon-circle {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: #eaf0ff;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 34px;
      color: #0a3454;
      margin: 0 auto 18px;
    }

    /* Título */
    h1 {
      font-size: 1.7rem;
      font-weight: 700;
      margin-bottom: 10px;
      color: #0a3454;
    }

    /* Texto */
    p {
      font-size: 1rem;
      color: #475569;
      margin-bottom: 28px;
      line-height: 1.5;
    }

    /* Botão */
    .primary-button {
      width: 100%;
      padding: 12px 0;
      background: #0a3454;
      color: white;
      border: none;
      border-radius: 10px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: 0.25s ease;
    }

    .primary-button:hover {
      background: #0b3e62;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
    }

    /* ANIMAÇÕES */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(15px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes float {
      0%   { transform: translateY(0); }
      50%  { transform: translateY(-6px); }
      100% { transform: translateY(0); }
    }

    .animate-icon {
      animation: float 3s ease-in-out infinite;
    }

    .animate-title {
      animation: fadeIn 0.6s ease forwards;
    }

    .animate-text {
      animation: fadeIn 0.8s ease forwards;
    }

    .animate-button {
      animation: fadeIn 1s ease forwards;
    }

    @media (max-width: 480px) {
      .forbidden-card {
        padding: 28px 22px;
      }

      .icon-circle {
        width: 70px;
        height: 70px;
        font-size: 28px;
      }

      h1 {
        font-size: 1.45rem;
      }
    }
  `]
})
export class ForbiddenPage {}
