import { Injectable, inject } from '@angular/core';
import { Router } from '@angular/router';
import { LocalStorageService } from './local-storage.service';
import { JwtDecoder } from '../../shared/util/jwt-decode';

@Injectable({ providedIn: 'root' })
export class AuthService {

  private storage = inject(LocalStorageService);

  get authData() {
    return this.storage.getObject('auth_data');
  }

  get role(): string | null {
    return this.authData?.user?.role || null;
  }

  get token(): string | null {
    return this.authData?.token || null;
  }

  isLogged(): boolean {
    const token = this.token;
    if (!token) return false;

    return !JwtDecoder.isExpired(token);
  }

  logout() {
    this.storage.deleteObject('auth_data');
  }
}
