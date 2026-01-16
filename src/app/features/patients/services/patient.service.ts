import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { BaseCrudService } from '../../../shared/services/base-crud/base-crud.service';

export interface Patient {
  id?: string;
  companyId?: string;
  jobFunctionId?: string;
  jobFunctionName?: string;
  sectorId?: string;
  sectorName?: string;
  name?: string;
  birthDate?: string;
  tenureMonths?: number;
  createdAt?: string;
  updatedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class PatientService extends BaseCrudService {
  private patientsSubject = new BehaviorSubject<Patient[]>([]);
  patients$ = this.patientsSubject.asObservable();

  private normalizeList(data: any): Patient[] {
    if (Array.isArray(data)) return data;
    if (data?.items) return data.items;
    if (data?.data) return data.data;
    return [];
  }

  loadAll(companyId: string): Observable<Patient[]> {
    return this.get<Patient[]>(`companies/${companyId}/patients`).pipe(
      tap((res) => {
        const list = this.normalizeList(res);
        this.patientsSubject.next(list);
      })
    );
  }

  getById(companyId: string, id: string): Observable<Patient> {
    return this.get<Patient>(`companies/${companyId}/patients/${id}`);
  }

  create(companyId: string, payload: Partial<Patient>): Observable<Patient> {
    return this.post<Patient>(`companies/${companyId}/patients`, payload).pipe(
      tap(() => this.loadAll(companyId).subscribe())
    );
  }

  update(companyId: string, id: string, payload: Partial<Patient>): Observable<Patient> {
    return this.put<Patient>(`companies/${companyId}/patients/${id}`, payload).pipe(
      tap(() => this.loadAll(companyId).subscribe())
    );
  }

  deleteById(companyId: string, id: string): Observable<any> {
    return this.delete<any>(`companies/${companyId}/patients/${id}`).pipe(
      tap(() => this.loadAll(companyId).subscribe())
    );
  }

  /**
   * Importa trabalhadores a partir de uma planilha Excel
   * A planilha deve conter as colunas: Setor, Função, Nome, DataNasc
   * 
   * @param companyId ID da empresa
   * @param file Arquivo Excel (.xlsx ou .xls)
   * @returns Observable com o resultado da importação
   */
  importFromExcel(companyId: string, file: File): Observable<any> {
    return new Observable((observer) => {
      const reader = new FileReader();
      
      reader.onload = async (e: any) => {
        try {
          // Importação dinâmica do xlsx
          const XLSX = await import('xlsx');
          const data = new Uint8Array(e.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          
          // Pega a primeira planilha
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          
          // Converte para o formato esperado pelo backend
          const payload = jsonData.map((row: any) => {
            // Converte a data do formato DD/MM/AAAA para AAAA-MM-DD
            let birthDate = '';
            if (row.DataNasc) {
              const dateStr = String(row.DataNasc);
              // Tenta diferentes formatos de data
              if (dateStr.includes('/')) {
                const parts = dateStr.split('/');
                if (parts.length === 3) {
                  birthDate = `${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                }
              } else if (dateStr.includes('-')) {
                birthDate = dateStr;
              }
            }
            
            return {
              sectorName: row.Setor || '',
              jobFunctionName: row.Função || row.Funcao || '',
              patientName: row.Nome || '',
              birthDate: birthDate,
              tenureMonths: 0
            };
          });
          
          // Envia para o backend
          this.post<any>(`companies/${companyId}/people/import`, payload).pipe(
            tap(() => this.loadAll(companyId).subscribe())
          ).subscribe({
            next: (result) => {
              observer.next(result);
              observer.complete();
            },
            error: (err) => {
              observer.error(err);
            }
          });
          
        } catch (error) {
          observer.error({ error: { message: 'Erro ao processar arquivo Excel' } });
        }
      };
      
      reader.onerror = () => {
        observer.error({ error: { message: 'Erro ao ler arquivo' } });
      };
      
      reader.readAsArrayBuffer(file);
    });
  }
}
