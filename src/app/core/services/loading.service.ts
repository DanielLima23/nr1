import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class LoadingService {
  private counter = 0;
  private state = new BehaviorSubject(false);
  loading$ = this.state.asObservable();

  show() { if (++this.counter === 1) this.state.next(true); }
  hide() { if (this.counter > 0 && --this.counter === 0) this.state.next(false); }
}
