import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private http = inject(HttpClient);
  private baseUrl = environment.apiUrl;

  private buildUrl(endpoint: string): string {
    return `${this.baseUrl}${endpoint}`;
  }

  get<T>(endpoint: string, options?: any) {
    return this.http.get<T>(this.buildUrl(endpoint), options);
  }

  post(endpoint: string, body: any, options?: any) {
    return this.http.post<any>(this.buildUrl(endpoint), body, options);
  }

  put<T>(endpoint: string, body: any, options?: any) {
    return this.http.put<T>(this.buildUrl(endpoint), body, options);
  }

  delete<T>(endpoint: string, options?: any) {
    return this.http.delete<T>(this.buildUrl(endpoint), options);
  }
}
