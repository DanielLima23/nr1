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
          
          // Encontra a linha do cabeçalho dinamicamente (procura por "NOME")
          const rawData: any[][] = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
          let headerRowIndex = 0;
          for (let i = 0; i < Math.min(rawData.length, 10); i++) {
            const row = rawData[i];
            if (Array.isArray(row) && row.some((cell: any) => String(cell).trim().toUpperCase() === 'NOME')) {
              headerRowIndex = i;
              break;
            }
          }
          
          const jsonData = XLSX.utils.sheet_to_json(firstSheet, { range: headerRowIndex });
          
          // Converte para o formato esperado pelo backend
          const payload = jsonData
            .filter((row: any) => {
              // Filtra linhas que tenham pelo menos o nome preenchido
              const nome = row.NOME ?? row.Nome ?? row.nome ?? '';
              return String(nome).trim().length > 0;
            })
            .map((row: any) => {
            const defaultBirthDate = '2000-01-01';
            const rawBirthDate =
              row['DATA DE NASCIMENTO'] ?? row.DataNasc ?? row['Data Nasc'] ?? row['Data Nascimento'] ?? row.DataNascimento ?? row.Nascimento;
            
            const toIsoDate = (date: Date) =>
              `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
            
            let birthDate = defaultBirthDate;

            if (rawBirthDate instanceof Date && !isNaN(rawBirthDate.getTime())) {
              birthDate = toIsoDate(rawBirthDate);
            } else if (typeof rawBirthDate === 'number') {
              // Excel armazena datas como números (dias desde 1900-01-01)
              const excelEpoch = new Date(1900, 0, 1);
              const daysOffset = rawBirthDate - 2; // Ajuste para bug do Excel (1900 não foi ano bissexto)
              const date = new Date(excelEpoch.getTime() + daysOffset * 24 * 60 * 60 * 1000);
              if (!isNaN(date.getTime())) {
                birthDate = toIsoDate(date);
              }
            } else if (rawBirthDate) {
              const dateStr = String(rawBirthDate).trim();
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
              sectorName: row.SETOR ?? row.Setor ?? row.setor ?? '',
              jobFunctionName: row['FUNÇÃO'] ?? row.Função ?? row.Funcao ?? row['FUNCAO'] ?? '',
              patientName: row.NOME ?? row.Nome ?? row.nome ?? '',
              birthDate,
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
