import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { RouterLink } from '@angular/router';
import { BaseComponent } from '../base-component/base-component';

@Component({
  selector: 'app-top-page',
  standalone: true,
  templateUrl: './top-page.component.html',
  styleUrls: ['./top-page.component.scss'],
  imports: [CommonModule, ButtonModule, RouterLink],
})
export class TopPageComponent extends BaseComponent {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() showBack: boolean = false; // padrao = nao mostrar
  @Input() backLink: string | any[] | null = null;
  @Input() backFallback: string | any[] = '/admin';
  @Input() backQueryParams: { [key: string]: any } | null = null;

  @Input() showAdd: boolean = false;
  @Input() addLabel: string = 'Novo';
  @Input() addIcon: string = 'pi pi-plus';
  @Input() addLink: string | any[] | null = null;
  @Input() addQueryParams: { [key: string]: any } | null = null;

  @Output() add = new EventEmitter<void>();

  handleBack(event: Event) {
    event.preventDefault();

    if (this.backLink) {
      if (this.backQueryParams) {
        this.router.navigate(
          Array.isArray(this.backLink) ? this.backLink : [this.backLink],
          { queryParams: this.backQueryParams }
        );
      } else {
        this.navigate(this.backLink);
      }
      return;
    }

    if (window.history.length > 1) {
      this.back();
      return;
    }

    this.navigate(this.backFallback || '/admin');
  }

  handleAdd(event: Event) {
    if (!this.addLink) {
      event.preventDefault();
      this.add.emit();
    }
  }
}
