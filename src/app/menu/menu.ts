import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { StationSearch } from '../station-search/station-search';
import { FavoriteCardComponent } from '../favorite-card/favorite-card';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { UiService } from '../ui.service';
import { FavoritesService } from '../favorites.service';
import { MtaColorsService } from '../mta-colors.service';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, RouterModule, StationSearch, FavoriteCardComponent, RouteBadgeComponent],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class MenuComponent {
  private uiService = inject(UiService);
  private favoritesService = inject(FavoritesService);
  private mtaColorsService = inject(MtaColorsService);
  private router = inject(Router);

  favorites = this.favoritesService.favorites;
  groupedLines = this.mtaColorsService.getGroupedLines();

  closeMenu(): void {
    this.uiService.closeMenu();
  }

  onStationSelected(station: string): void {
    const encodedStation = encodeURIComponent(station);
    this.router.navigate(['/station', encodedStation]);
    this.closeMenu();
  }
}
