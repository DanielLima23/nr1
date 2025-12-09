import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule, ButtonModule],
  templateUrl: './confirm-modal.component.html',
  styleUrls: ['./confirm-modal.component.scss'],
})
export class ConfirmModalComponent {
  @Input() visible = false;
  @Input() title = 'Confirmar ação';
  @Input() message = 'Confirme para prosseguir.';
  @Input() confirmLabel = 'Confirmar';
  @Input() cancelLabel = 'Cancelar';
  @Input() icon = 'pi pi-exclamation-triangle';
  @Input() confirmIcon: string | null = 'pi pi-trash';
  @Input() loading = false;

  @Output() confirm = new EventEmitter<void>();
  @Output() cancel = new EventEmitter<void>();

  onConfirm() {
    if (this.loading) return;
    this.confirm.emit();
  }

  onCancel() {
    if (this.loading) return;
    this.cancel.emit();
  }
}
