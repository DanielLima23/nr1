import { Component } from '@angular/core';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-toast-global',
  standalone: true,
  imports: [ToastModule],
  providers: [MessageService],
  template: `<p-toast position="top-right"></p-toast>`
})
export class ToastGlobalComponent {}
