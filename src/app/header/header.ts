import { Component, Input, Output, EventEmitter, inject } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { filter } from 'rxjs';
import { Menu } from '../menu/menu.component';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  standalone: true,
  imports: [RouterModule, CommonModule, Menu],
})
export class HeaderComponent {
  @Input() isFavorite: boolean = false;
  @Input() isFavoriteEnabled: boolean = false;
  @Input() showFavoriteStar: boolean = false;
  @Output() toggleFavorite = new EventEmitter<void>();

  protected titleService = inject(TitleService);

  isHomePage: boolean = false;
  isMenuVisible: boolean = false;

  constructor(private location: Location, private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isHomePage = (event as NavigationEnd).urlAfterRedirects === '/';
      });
  }

  onToggleFavorite(): void {
    if (this.isFavoriteEnabled) {
      this.toggleFavorite.emit();
    }
  }

  toggleMenu(): void {
    this.isMenuVisible = !this.isMenuVisible;
  }

  closeMenu(): void {
    this.isMenuVisible = false;
  }

  goBack(): void {
    this.location.back();
  }
}
