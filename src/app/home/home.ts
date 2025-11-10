import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtaColorsService } from '../mta-colors.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { Router, RouterModule } from '@angular/router';
import { StationSearch } from '../station-search/station-search';
import { HeaderComponent } from '../header/header';
import { FavoritesService } from '../favorites.service';
import { FavoriteCardComponent } from '../favorite-card/favorite-card';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouteBadgeComponent,
    RouterModule,
    StationSearch,
    HeaderComponent,
    FavoriteCardComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {
  protected mtaColorsService = inject(MtaColorsService);
  protected favoritesService = inject(FavoritesService);
  private router = inject(Router);
  protected groupedLines = this.mtaColorsService.getGroupedLines();

  onStationSelected(station: string): void {
    const encodedStation = encodeURIComponent(station);
    this.router.navigate(['/station', encodedStation]);
  }
}
