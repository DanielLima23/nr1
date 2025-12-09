import { Injectable, inject } from '@angular/core';
import { tap } from 'rxjs';
import { HttpService } from '../../../../shared/services/http-service/http.service';
import { LocalStorageService } from '../../../../core/services/local-storage.service';
import { JwtDecoder } from '../../../../shared/util/jwt-decode';

@Injectable({ providedIn: 'root' })
export class LoginService {
  private http = inject(HttpService);
  private storage = inject(LocalStorageService);

  login(credentials: any) {
    return this.http.post('auth/login', credentials, {
      responseType: 'text' as 'json'
    })
    .pipe(
      tap((token: any) => {

        console.log('TOKEN RECEBIDO:', token);

        if (!token) {
          console.warn('Token vazio.');
          return;
        }

        const decoded: any = JwtDecoder.decode(token);

        this.storage.setObject('auth_data', {
          token,
          user: decoded,
          exp: decoded?.exp
        });
      })
    );
  }
}
