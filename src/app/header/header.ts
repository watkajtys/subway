import { Component, Input, Output, EventEmitter } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class HeaderComponent {
  @Input() title: string = '';
  @Input() isFavorite: boolean = false;
  @Input() isFavoriteEnabled: boolean = false;
  @Input() showFavoriteStar: boolean = false;
  @Output() toggleFavorite = new EventEmitter<void>();

  isHomePage: boolean = false;

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

  goBack(): void {
    this.location.back();
  }
}
