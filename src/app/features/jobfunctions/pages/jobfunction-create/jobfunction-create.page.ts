import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import {
  JobFunctionService,
  JobFunction,
} from '../../services/jobfunction.service';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';

@Component({
  selector: 'app-jobfunction-create',
  standalone: true,
  templateUrl: './jobfunction-create.page.html',
  styleUrls: ['./jobfunction-create.page.scss'],
  imports: [
    CommonModule,
    TopPageComponent,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    RouterModule,
  ],
})
export class JobFunctionCreatePage extends BaseComponent implements OnInit {
  fb = inject(FormBuilder);
  service = inject(JobFunctionService);

  companyId!: string;
  sectorId!: string;
  jobFunctionId?: string;
  submitted = false;

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
  });

  ngOnInit(): void {
    this.companyId = this.route.snapshot.params['id'];
    this.sectorId = this.route.snapshot.params['sectorId'];
    this.jobFunctionId = this.route.snapshot.params['jobFunctionId'];

    if (this.jobFunctionId) {
      this.service
        .getById(this.companyId, this.sectorId, this.jobFunctionId)
        .subscribe((jobFunction) => {
          this.form.patchValue(jobFunction);
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
    const body = this.form.value as Partial<JobFunction>;

    if (this.jobFunctionId) {
      this.service.update(this.companyId, this.sectorId, this.jobFunctionId, body).subscribe({
        next: () => {
          this.toast.success('Funcao atualizada com sucesso!');
          this.navigate(['/admin/empresa', this.companyId, 'setores', this.sectorId, 'funcoes']);
        },
        error: () => this.toast.error('Erro ao atualizar funcao.'),
      });
    } else {
      this.service.create(this.companyId, this.sectorId, body).subscribe({
        next: () => {
          this.toast.success('Funcao criada com sucesso!');
          this.navigate(['/admin/empresa', this.companyId, 'setores', this.sectorId, 'funcoes']);
        },
        error: () => this.toast.error('Erro ao criar funcao.'),
      });
    }
  }
}

