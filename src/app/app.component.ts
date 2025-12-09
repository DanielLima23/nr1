import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { LoadingSpinnerComponent } from './shared/components/loading-spinner/loading-spinner.component';
import { ToastGlobalComponent } from './shared/components/toast-global/toast-global.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, LoadingSpinnerComponent, ToastGlobalComponent],
  template: `
    <app-loading-spinner></app-loading-spinner>
    <app-toast-global></app-toast-global>
    <router-outlet></router-outlet>
  `,
})
export class AppComponent {}
