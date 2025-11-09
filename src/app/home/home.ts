import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtaColorsService } from '../mta-colors.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { RouterModule } from '@angular/router';
import { StationSearch } from '../station-search/station-search';
import { FavoritesService } from '../favorites.service';
import { FavoriteCardComponent } from '../favorite-card/favorite-card';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouteBadgeComponent,
    RouterModule,
    StationSearch,
    FavoriteCardComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {
  protected mtaColorsService = inject(MtaColorsService);
  protected favoritesService = inject(FavoritesService);
  protected groupedLines = this.mtaColorsService.getGroupedLines();

  constructor() {
    inject(TitleService).title.set('Did I Miss My Train');
  }
}
