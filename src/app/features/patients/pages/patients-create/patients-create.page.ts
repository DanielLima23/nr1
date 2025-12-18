import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import { RouterLink } from '@angular/router';
import { PatientService, Patient } from '../../services/patient.service';
import { EmpresaService, Company } from '../../../empresa/services/empresa.service';
import { SectorService, Sector } from '../../../sectors/services/sector.service';
import { JobFunctionService, JobFunction } from '../../../jobfunctions/services/jobfunction.service';

@Component({
  selector: 'app-patients-create',
  standalone: true,
  templateUrl: './patients-create.page.html',
  styleUrls: ['./patients-create.page.scss'],
  imports: [
    CommonModule,
    TopPageComponent,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    RouterLink,
  ],
})
export class PatientsCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private patientService = inject(PatientService);
  private companyService = inject(EmpresaService);
  private sectorService = inject(SectorService);
  private jobFunctionService = inject(JobFunctionService);

  patientId = this.id();
  companyIdParam = this.route.snapshot.queryParamMap.get('companyId');
  pageTitle = 'Novo trabalhador(a)';

  companies: Company[] = [];
  sectors: Sector[] = [];
  jobFunctions: JobFunction[] = [];
  submitted = false;

  form = this.fb.group({
    companyId: [this.companyIdParam || '', Validators.required],
    sectorId: ['', Validators.required],
    jobFunctionId: ['', Validators.required],
    name: ['', Validators.required],
    birthDate: ['', Validators.required],
    tenureMonths: [0, [Validators.required, Validators.min(0)]],
  });

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadCompanies();

    const companyId = this.form.value.companyId as string;
    if (companyId) {
      this.onCompanyChange(companyId, false);
    }

    if (this.patientId && companyId) {
      this.loadPatient(companyId);
    } else {
      this.pageTitle = 'Novo trabalhador(a)';
    }
  }

  private loadPatient(companyId: string) {
    this.patientService.getById(companyId, this.patientId!).subscribe({
      next: (patient) => {
        if (!patient) return;
        this.form.patchValue({
          companyId: patient.companyId,
          sectorId: patient.sectorId,
          jobFunctionId: patient.jobFunctionId,
          name: patient.name,
          birthDate: patient.birthDate,
          tenureMonths: patient.tenureMonths,
        });

        if (patient.companyId) {
          this.onCompanyChange(patient.companyId, false, patient.sectorId);
        }
        if (patient.companyId && patient.sectorId) {
          this.onSectorChange(patient.companyId, patient.sectorId, false);
        }
        this.pageTitle = `Editar trabalhador(a) ${patient?.name ?? ''}`.trim();
      },
      error: () => this.toast.error('Erro ao carregar trabalhador(a).'),
    });
  }

  private loadCompanies() {
    this.companyService.loadCompanies().subscribe({
      next: (list) => (this.companies = list || []),
    });
  }

  onCompanyChange(companyId: string | null, reset = true, sectorToSelect?: string | null) {
    if (reset) {
      this.form.patchValue({ sectorId: '', jobFunctionId: '' });
      this.jobFunctions = [];
    }
    if (!companyId) {
      this.sectors = [];
      return;
    }
    this.sectorService.list(companyId).subscribe({
      next: (list) => {
        this.sectors = list || [];
        if (sectorToSelect) {
          this.form.patchValue({ sectorId: sectorToSelect });
        }
      },
      error: () => this.toast.error('Erro ao carregar setores.'),
    });
  }

  onSectorChange(companyId: string | null, sectorId: string | null, reset = true) {
    if (reset) this.form.patchValue({ jobFunctionId: '' });
    if (!companyId || !sectorId) {
      this.jobFunctions = [];
      return;
    }
    this.jobFunctionService.list(companyId, sectorId).subscribe({
      next: (list) => (this.jobFunctions = list || []),
      error: () => this.toast.error('Erro ao carregar funcoes.'),
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

    const value = this.form.value;
    const payload: Partial<Patient> = {
      jobFunctionId: value.jobFunctionId || undefined,
      name: value.name?.trim() || undefined,
      birthDate: value.birthDate || undefined,
      tenureMonths: Number(value.tenureMonths ?? 0),
    };

    const companyId = value.companyId as string;

    if (this.patientId) {
      this.patientService.update(companyId, this.patientId, payload).subscribe({
        next: () => {
          this.toast.success('Paciente atualizado com sucesso!');
          this.router.navigate(['/admin/pacientes'], { queryParams: { companyId } });
        },
        error: () => this.toast.error('Erro ao atualizar paciente.'),
      });
    } else {
      this.patientService.create(companyId, payload).subscribe({
        next: () => {
          this.toast.success('Paciente criado com sucesso!');
          this.router.navigate(['/admin/pacientes'], { queryParams: { companyId } });
        },
        error: () => this.toast.error('Erro ao criar paciente.'),
      });
    }
  }
}
