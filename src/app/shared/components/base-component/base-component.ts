import { inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastService } from '../../services/toast.service';

export abstract class BaseComponent {
  protected router = inject(Router);
  protected route = inject(ActivatedRoute);
  toast = inject(ToastService);

  loading = signal(false);

  id(): string | null {
    return this.route.snapshot.params['id'] ?? null;
  }

  navigate(path: string | any[]) {
    this.router.navigate(Array.isArray(path) ? path : [path]);
  }

  back(){
    window.history.back();
  }

  patch(form: any, data: any) {
    if (data) form.patchValue(data);
  }
}
