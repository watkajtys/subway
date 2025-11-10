import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  public menuOpen = signal(false);

  public openMenu(): void {
    this.menuOpen.set(true);
    document.body.classList.add('overflow-hidden');
  }

  public closeMenu(): void {
    this.menuOpen.set(false);
    document.body.classList.remove('overflow-hidden');
  }
}
