import { Component, OnInit, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DropdownModule } from 'primeng/dropdown';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../../../../shared/components/base-component/base-component';
import { TopPageComponent } from '../../../../shared/components/top-page/top-page.component';
import {
  ChecklistService,
  ChecklistItem,
} from '../../services/checklist.service';
import {
  PatientChecklist,
  PatientChecklistService,
} from '../../services/patient-checklist.service';
import {
  PatientRisk,
  PatientRiskActionPlan,
  PatientRiskService,
} from '../../../patient-risks/services/patient-risk.service';
import { RiskService } from '../../../risks/services/risk.service';
import { PatientRiskActionPlanService } from '../../../patient-risks/services/patient-risk-action-plan.service';
import { ActionPlan, ActionPlanService } from '../../../actions/services/action-plan.service';
import { forkJoin, from, of } from 'rxjs';
import { concatMap, switchMap, toArray } from 'rxjs/operators';

interface LocalPlan {
  tempId: string;
  title: string;
  description?: string;
  responsible?: string;
  dueDate?: string;
  completed: boolean;
  existingId?: string | null;
}

interface LocalPatientRisk {
  tempId: string;
  riskId: string;
  riskTitle: string;
  notes?: string;
  plans: LocalPlan[];
  existingId?: string | null;
}

@Component({
  selector: 'app-patient-checklist-create',
  standalone: true,
  templateUrl: './patient-checklist-create.page.html',
  styleUrls: ['./patient-checklist-create.page.scss'],
  imports: [
    CommonModule,
    TopPageComponent,
    ReactiveFormsModule,
    DropdownModule,
    ButtonModule,
    RouterLink,
  ],
})
export class PatientChecklistCreatePage extends BaseComponent implements OnInit {
  private fb = inject(FormBuilder);
  private checklistService = inject(ChecklistService);
  private patientChecklistService = inject(PatientChecklistService);
  private patientRiskService = inject(PatientRiskService);
  private riskService = inject(RiskService);
  private actionPlanService = inject(PatientRiskActionPlanService);
  private actionPlanMasterService = inject(ActionPlanService);

  companyId = this.route.snapshot.queryParamMap.get('companyId') || '';
  patientId = this.route.snapshot.params['patientId'];

  checklists: any[] = [];
  items: ChecklistItem[] = [];
  submitted = false;

  riskOptions: { label: string; value: string }[] = [];
  patientRisks: LocalPatientRisk[] = [];
  riskFormSubmitted = false;
  planFormSubmitted = new Set<string>();
  planDrafts: Record<string, FormGroup> = {};
  planFormVisible: Record<string, boolean> = {};

  form = this.fb.group({
    checklistId: ['', Validators.required],
    performedAt: [this.currentLocalDateTime(), Validators.required],
    answers: this.fb.array([]),
  });

  riskForm = this.fb.group({
    riskId: ['', Validators.required],
  });

  get answersArray(): FormArray {
    return this.form.get('answers') as FormArray;
  }

  answerGroup(idx: number): FormGroup {
    return this.answersArray.at(idx) as FormGroup;
  }

  constructor() {
    super();
  }

  ngOnInit(): void {
    this.loadChecklists();
    this.loadRiskOptions();
  }

  private loadChecklists() {
    this.checklistService.list().subscribe({
      next: (list) => (this.checklists = list || []),
      error: () => this.toast.error('Erro ao carregar checklists.'),
    });
  }

  private loadRiskOptions() {
    this.riskService.loadAll().subscribe({
      next: (list) => {
        this.riskOptions = (list || []).map((r: any) => ({
          label: r.title,
          value: r.id,
        }));
      },
      error: () => this.toast.error('Erro ao carregar riscos.'),
    });
  }

  private loadExistingRisks() {
    if (!this.companyId || !this.patientId) return;
    this.patientRiskService
      .list(this.companyId, this.patientId)
      .pipe(
        switchMap((risks: PatientRisk[]) => {
          if (!risks?.length) return of([]);
          return forkJoin(
            risks.map((risk) =>
              this.actionPlanService
                .list(this.companyId, this.patientId, risk.id)
                .pipe(
                  switchMap((plans) =>
                    of({
                      risk,
                      plans: plans || [],
                    })
                  )
                )
            )
          );
        })
      )
      .subscribe({
        next: (entries: any[]) => {
          const locals: LocalPatientRisk[] = (entries || []).map((entry) =>
            this.toLocalRisk(entry.risk, entry.plans || [])
          );
          this.patientRisks = locals;
          locals.forEach((r) => {
            this.planDrafts[r.tempId] = this.fb.group({
              title: ['', Validators.required],
              description: [''],
              responsible: [''],
              dueDate: [''],
            });
            this.planFormVisible[r.tempId] = false;
          });
        },
        error: () => this.toast.error('Erro ao carregar riscos existentes.'),
      });
  }

  submitRisk() {
    this.riskFormSubmitted = true;
    if (this.riskForm.invalid) {
      this.riskForm.markAllAsTouched();
      return;
    }

    const riskId = this.riskForm.value.riskId || '';
    const already = this.patientRisks.find((r) => r.riskId === riskId);
    if (already) {
      this.toast.warn('Esse risco ja foi adicionado.');
      return;
    }

    const riskTitle =
      this.riskOptions.find((r) => r.value === riskId)?.label || 'Risco';

    const tempId = this.generateTempId();
    this.patientRisks.push({
      tempId,
      riskId,
      riskTitle,
      notes: '',
      plans: [],
    });

    this.planDrafts[tempId] = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      responsible: [''],
      dueDate: [''],
    });
    this.planFormVisible[tempId] = false;

    this.loadActionPlansFromMaster(riskId, tempId);

    this.riskFormSubmitted = false;
    this.riskForm.reset({ riskId: '' });
  }

  private loadActionPlansFromMaster(riskId: string, riskTempId: string) {
    this.actionPlanMasterService.loadAll(riskId).subscribe({
      next: (plans: ActionPlan[]) => {
        const localPlans = (plans || []).map((p) => this.toLocalPlanFromActionPlan(p));
        const target = this.patientRisks.find((r) => r.tempId === riskTempId);
        if (target) {
          target.plans = [...localPlans, ...(target.plans || [])];
        }
      },
      error: () => this.toast.warn('Nao foi possivel carregar planos do risco.'),
    });
  }

  addPlan(risk: LocalPatientRisk) {
    const form = this.planDrafts[risk.tempId] || this.fb.group({
      title: ['', Validators.required],
      description: [''],
      responsible: [''],
      dueDate: [''],
    });
    this.planDrafts[risk.tempId] = form;
    this.planFormSubmitted.add(risk.tempId);
    if (!form || form.invalid) {
      form?.markAllAsTouched();
      return;
    }

    const value = form.value;
    risk.plans.push({
      tempId: this.generateTempId(),
      title: value.title,
      description: value.description || '',
      responsible: value.responsible || '',
      dueDate: value.dueDate || '',
      completed: false,
      existingId: null,
    });

    this.planFormSubmitted.delete(risk.tempId);
    form.reset({ title: '', description: '', responsible: '', dueDate: '' });
    this.planFormVisible[risk.tempId] = false;
  }

  private currentLocalDateTime(): string {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    return new Date(now.getTime() - offsetMs).toISOString().slice(0, 16);
  }

  private generateTempId(): string {
    return Math.random().toString(36).substring(2, 9);
  }

  private toLocalRisk(
    risk: PatientRisk,
    plans: PatientRiskActionPlan[]
  ): LocalPatientRisk {
    const tempId = this.generateTempId();
    return {
      tempId,
      riskId: risk.riskId,
      riskTitle: risk.riskTitle || 'Risco',
      notes: risk.notes || '',
      existingId: risk.id,
      plans: (plans || []).map((p) => ({
        tempId: this.generateTempId(),
        title: p.title || '',
        description: p.description || '',
        responsible: p.responsible || '',
        dueDate: p.dueDate || '',
        completed: !!p.completed,
        existingId: p.id,
      })),
    };
  }

  private toLocalPlanFromActionPlan(plan: ActionPlan): LocalPlan {
    return {
      tempId: this.generateTempId(),
      title: plan.title || '',
      description: plan.description || '',
      responsible: plan.responsible || '',
      dueDate: plan.dueDate || '',
      completed: !!plan.completed,
      existingId: plan.id || null,
    };
  }

  onChecklistChange(checklistId: string) {
    if (!checklistId) {
      this.items = [];
      this.answersArray.clear();
      return;
    }

    this.checklistService.getById(checklistId).subscribe({
      next: (checklist) => {
        this.items = checklist?.items || [];
        this.buildAnswers();
      },
      error: () => this.toast.error('Erro ao carregar itens do checklist.'),
    });
  }

  private buildAnswers() {
    this.answersArray.clear();
    this.items.forEach((item) => {
      this.answersArray.push(
        this.fb.group({
          checklistItemId: [item.id],
          checklistOptionId: ['', Validators.required],
          explanation: [''],
        })
      );
    });
  }

  onOptionChange(controlIndex: number, option: any) {
    const control = this.answersArray.at(controlIndex) as FormGroup;
    if (!control) return;

    const explanationCtrl = control.get('explanation');

    if (option?.requireExplanation) {
      explanationCtrl?.setValidators([Validators.required]);
    } else {
      explanationCtrl?.clearValidators();
      control.patchValue({ explanation: '' });
    }

    explanationCtrl?.updateValueAndValidity();
  }

  isInvalid(field: string): boolean {
    const control = this.form.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  isAnswerInvalid(index: number, field: string): boolean {
    const group = this.answerGroup(index);
    const control = group?.get(field);
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  requiresExplanation(index: number): boolean {
    const selectedId = this.answerGroup(index)?.get('checklistOptionId')?.value;
    const item = this.items[index];
    const opt = item?.options?.find((o) => o.id === selectedId);
    return !!opt?.requireExplanation;
  }

  isExplanationInvalid(index: number): boolean {
    if (!this.requiresExplanation(index)) return false;
    const control = this.answerGroup(index)?.get('explanation');
    return !!control && control.invalid && (control.touched || this.submitted);
  }

  isRiskInvalid(field: string): boolean {
    const control = this.riskForm.get(field);
    return !!control && control.invalid && (control.touched || this.riskFormSubmitted);
  }

  isPlanInvalid(field: string, riskTempId: string): boolean {
    const form = this.planDrafts[riskTempId];
    const control = form?.get(field);
    const submitted = this.planFormSubmitted.has(riskTempId);
    return !!control && control.invalid && (control.touched || submitted);
  }

  togglePlanForm(riskTempId: string) {
    this.planFormVisible[riskTempId] = !this.planFormVisible[riskTempId];
  }

  removePlan(risk: LocalPatientRisk, plan: LocalPlan) {
    if (!plan || !risk) return;
    // Apenas remove planos locais ou pendentes; existentes seguem intocados
    if (plan.existingId) return;
    risk.plans = risk.plans.filter((p) => p.tempId !== plan.tempId);
  }

  removeRisk(risk: LocalPatientRisk) {
    if (!risk) return;
    this.patientRisks = this.patientRisks.filter((r) => r.tempId !== risk.tempId);
    delete this.planDrafts[risk.tempId];
    this.planFormSubmitted.delete(risk.tempId);
    delete this.planFormVisible[risk.tempId];
  }

  submit() {
    this.submitted = true;
    if (this.form.invalid || !this.companyId || !this.patientId) {
      this.form.markAllAsTouched();
      this.answersArray.controls.forEach((ctrl) => ctrl.markAllAsTouched());
      return;
    }

    const value = this.form.value;
    const performedAtIso = value.performedAt
      ? new Date(value.performedAt).toISOString()
      : undefined;

    const payload: Partial<PatientChecklist> = {
      checklistId: value.checklistId || undefined,
      performedAt: performedAtIso,
      answers: (value.answers || []).map((a: any) => ({
        checklistItemId: a.checklistItemId,
        checklistOptionId: a.checklistOptionId,
        explanation: a.explanation || null,
      })),
    };

    this.patientChecklistService
      .create(this.companyId, this.patientId, payload)
      .pipe(
        switchMap(() => {
          if (!this.patientRisks.length) return of(null);
          return from(this.patientRisks).pipe(
            concatMap((risk) => {
              const createRisk$ = risk.existingId
                ? of({ id: risk.existingId })
                : this.patientRiskService.create(this.companyId, this.patientId, {
                    riskId: risk.riskId,
                    notes: risk.notes || undefined,
                  });

              return createRisk$.pipe(
                switchMap((created) => {
                  const riskId = created?.id;
                  if (!riskId) return of(null);
                  const plansToSave = risk.plans || [];
                  if (!plansToSave.length) return of(null);
                  return forkJoin(
                    plansToSave.map((plan) =>
                      this.actionPlanService.create(
                        this.companyId,
                        this.patientId,
                        riskId,
                        {
                          title: plan.title,
                          description: plan.description || undefined,
                          responsible: plan.responsible || undefined,
                          dueDate: plan.dueDate || undefined,
                          completed: false,
                        }
                      )
                    )
                  );
                })
              );
            }),
            toArray()
          );
        })
      )
      .subscribe({
        next: () => {
          this.toast.success('Checklist realizado com sucesso!');
          this.router.navigate(['/admin/pacientes', this.patientId, 'checklists'], {
            queryParams: { companyId: this.companyId },
          });
        },
        error: () => this.toast.error('Erro ao salvar checklist.'),
      });
  }
}
