import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class BaseCrudService {
  protected http = inject(HttpClient);
  protected baseUrl = environment.apiUrl;

  get<T>(endpoint: string) {
    return this.http.get<T>(this.baseUrl + endpoint);
  }

  post<T>(endpoint: string, body: any) {
    return this.http.post<T>(this.baseUrl + endpoint, body);
  }

  put<T>(endpoint: string, body: any) {
    return this.http.put<T>(this.baseUrl + endpoint, body);
  }

  delete<T>(endpoint: string) {
    return this.http.delete<T>(this.baseUrl + endpoint);
  }
}
