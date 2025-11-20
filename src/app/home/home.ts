import { Component, inject } from '@angular/core';
import { MetaService } from '../meta.service';
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

  constructor(private metaService: MetaService) {
    this.metaService.updateTags(
      'Did I Miss My Train?',
      "Live MTA subway departure times for New York City",
      this.router.url
    );
  }

  onStationSelected(station: string): void {
    const encodedStation = encodeURIComponent(station)
      .replace(/\(/g, '%28')
      .replace(/\)/g, '%29');
    this.router.navigateByUrl(`/station/${encodedStation}`);
  }
}
