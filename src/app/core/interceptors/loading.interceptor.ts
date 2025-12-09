import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { finalize } from 'rxjs';
import { LoadingService } from '../services/loading.service';

export const loadingInterceptor: HttpInterceptorFn = (req, next) => {
  const loader = inject(LoadingService);

  loader.show(); // liga spinner

  return next(req).pipe(
    finalize(() => {
      loader.hide(); // sempre executa (sucesso, erro, cors, network error)
    })
  );
};
