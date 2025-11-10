import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UiService {
  public menuOpen = signal(false);

  public openMenu(): void {
    this.menuOpen.set(true);
  }

  public closeMenu(): void {
    this.menuOpen.set(false);
  }
}
