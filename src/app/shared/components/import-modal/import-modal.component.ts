import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { FileUploadModule } from 'primeng/fileupload';

@Component({
  selector: 'app-import-modal',
  standalone: true,
  templateUrl: './import-modal.component.html',
  styleUrls: ['./import-modal.component.scss'],
  imports: [
    CommonModule,
    FormsModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    FileUploadModule,
  ],
})
export class ImportModalComponent {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  @Input() visible = false;
  @Input() title = 'Importar Planilha';
  @Input() companies: any[] = [];
  @Input() loading = false;

  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() confirm = new EventEmitter<{ companyId: string; file: File }>();
  @Output() cancel = new EventEmitter<void>();

  selectedCompanyId: string | null = null;
  selectedFile: File | null = null;
  fileName = '';

  onFileSelect(event: any) {
    const file = event.target.files?.[0];
    if (file) {
      this.selectedFile = file;
      this.fileName = file.name;
    }
  }

  onConfirm() {
    if (this.selectedCompanyId && this.selectedFile) {
      this.confirm.emit({
        companyId: this.selectedCompanyId,
        file: this.selectedFile,
      });
    }
  }

  onCancel() {
    this.resetForm();
    this.cancel.emit();
  }

  onHide() {
    this.resetForm();
    this.visibleChange.emit(false);
  }

  resetForm() {
    this.selectedCompanyId = null;
    this.selectedFile = null;
    this.fileName = '';
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  get isValid(): boolean {
    return !!this.selectedCompanyId && !!this.selectedFile;
  }

  downloadTemplate() {
    const link = document.createElement('a');
    link.href = '/assets/planilha-modelo-avaliacoes.xlsx';
    link.download = 'planilha-modelo-avaliacoes.xlsx';
    link.click();
  }
}
