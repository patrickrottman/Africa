import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ScrollService {
  private positions = new Map<string, number>();

  savePosition(key: string): void {
    this.positions.set(key, window.scrollY);
  }

  restorePosition(key: string): void {
    const position = this.positions.get(key);
    if (position !== undefined) {
      setTimeout(() => {
        window.scrollTo(0, position);
      }, 0);
    }
  }

  clearPosition(key: string): void {
    this.positions.delete(key);
  }
}
