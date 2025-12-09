import { NgModule } from '@angular/core';

import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { TableModule } from 'primeng/table';
import { DropdownModule } from 'primeng/dropdown';
import { IconFieldModule } from 'primeng/iconfield';

@NgModule({
  exports:[
    ButtonModule,
    InputTextModule,
    PasswordModule,
    ToastModule,
    DialogModule,
    TableModule,
    DropdownModule,
    IconFieldModule,
  ]
})
export class PrimeNgModule {}
