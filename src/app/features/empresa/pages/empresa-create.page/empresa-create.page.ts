import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormsModule,
  Validators,
} from '@angular/forms';
import { formatPhone } from '../../../../shared/util/phone.util';
import { ButtonModule } from 'primeng/button';
import { EmpresaService } from '../../services/empresa.service';
import { Company } from '../../services/empresa.service';

@Component({
  selector: 'app-empresa-create',
  standalone: true,
  templateUrl: './empresa-create.page.html',
  styleUrls: ['./empresa-create.page.scss'],
  imports: [
    CommonModule,
    TopPageComponent,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
  ],
})
export class EmpresaCreatePage extends BaseComponent implements OnInit {
  fb = inject(FormBuilder);
  service = inject(EmpresaService);
  companyId = this.id();
  submitted = false;
  pageTitle = 'Nova empresa';

  form = this.fb.group({
    name: ['', Validators.required],
    responsibleName: ['', Validators.required],
    responsibleEmail: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    address: ['', Validators.required],
    observations: [''],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    if (this.companyId) {
      this.service.getById(this.companyId).subscribe((company) => {
        this.form.patchValue(company);
        this.formatExistingPhone();
        this.pageTitle = `Editar empresa ${company?.name ?? ''}`.trim();
      });
    } else {
      this.pageTitle = 'Nova empresa';
    }

    this.form
      .get('phone')
      ?.valueChanges.subscribe((value) =>
        this.applyPhoneMask(value ?? '')
      );
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  onPhoneInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    this.applyPhoneMask(value);
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const body = this.form.value;

    if (this.companyId) {
      this.service.update(this.companyId, body as Partial<Company>).subscribe({
        next: () => {
          this.toast.success('Empresa atualizada com sucesso!');
          this.navigate('/admin/empresa');
        },
        error: () => this.toast.error('Erro ao atualizar empresa.'),
      });
    } else {
      this.service.create(body as Partial<Company>).subscribe({
        next: () => {
          this.toast.success('Empresa criada com sucesso!');
          this.navigate('/admin/empresa');
        },
        error: () => this.toast.error('Erro ao criar empresa.'),
      });
    }
  }

  private applyPhoneMask(raw: string) {
    const control = this.form.get('phone');
    if (!control) return;
    const formatted = formatPhone(raw);
    if (formatted !== raw) {
      control.setValue(formatted, { emitEvent: false });
    }
  }

  private formatExistingPhone() {
    const phone = this.form.get('phone')?.value ?? '';
    this.applyPhoneMask(phone);
  }
}
