import { Injectable, inject } from '@angular/core';
import { MessageService } from 'primeng/api';

@Injectable({
  providedIn: 'root',
})
export class ToastService {
  private messageService = inject(MessageService);

  /**
   * Exibe uma mensagem genérica
   */
  show(
    severity: 'success' | 'info' | 'warn' | 'error',
    summary: string,
    detail: string,
    life: number = 3500
  ) {
    this.messageService.add({ severity, summary, detail, life });
  }

  /**
   * Atalhos para facilitar o uso
   */
  success(detail: string, summary = 'Sucesso', life = 3000) {
    this.show('success', summary, detail, life);
  }

  info(detail: string, summary = 'Informação', life = 3000) {
    this.show('info', summary, detail, life);
  }

  warn(detail: string, summary = 'Aviso', life = 3000) {
    this.show('warn', summary, detail, life);
  }

  error(detail: string, summary = 'Erro', life = 3500) {
    this.show('error', summary, detail, life);
  }

  /**
   * Remove todos os toasts
   */
  clear() {
    this.messageService.clear();
  }
}
