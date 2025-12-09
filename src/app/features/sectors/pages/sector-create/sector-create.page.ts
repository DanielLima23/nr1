import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { SectorService, Sector } from '../../services/sector.service';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';

@Component({
  selector: 'app-sector-create',
  standalone: true,
  templateUrl: './sector-create.page.html',
  styleUrls: ['./sector-create.page.scss'],
  imports: [TopPageComponent, ReactiveFormsModule, FormsModule, ButtonModule, CommonModule, RouterModule],
})
export class SectorCreatePage extends BaseComponent implements OnInit {
  fb = inject(FormBuilder);
  service = inject(SectorService);

  companyId!: string;
  sectorId?: string;
  submitted = false;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.sectorId = this.route.snapshot.params['sectorId'];

    if (this.sectorId) {
      this.service.getById(this.companyId, this.sectorId).subscribe((sector) => {
        this.form.patchValue(sector);
      });
    }
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

    const body = this.form.value as Partial<Sector>;

    if (this.sectorId) {
      this.service.update(this.companyId, this.sectorId, body).subscribe({
        next: () => {
          this.toast.success('Setor atualizado com sucesso!');
          this.navigate(['/admin/empresa', this.companyId, 'setores']);
        },
        error: () => this.toast.error('Erro ao atualizar setor.'),
      });
    } else {
      this.service.create(this.companyId, body).subscribe({
        next: () => {
          this.toast.success('Setor criado com sucesso!');
          this.navigate(['/admin/empresa', this.companyId, 'setores']);
        },
        error: () => this.toast.error('Erro ao criar setor.'),
      });
    }
  }
}
