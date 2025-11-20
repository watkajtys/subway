import { Component, inject, computed } from '@angular/core';
import { MetaService } from '../meta.service';
import { CommonModule } from '@angular/common';
import { MtaColorsService } from '../mta-colors.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { Router, RouterModule } from '@angular/router';
import { StationSearch } from '../station-search/station-search';
import { HeaderComponent } from '../header/header';
import { FavoritesService } from '../favorites.service';
import { FavoriteCardComponent } from '../favorite-card/favorite-card';
import { StateService } from '../state.service';
import { ScheduleService, LineStatus } from '../schedule.service';

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
  private stateSvc = inject(StateService);
  private scheduleSvc = inject(ScheduleService);

  protected groupedLines = this.mtaColorsService.getGroupedLines();

  protected lineStatuses = computed(() => {
    const time = this.stateSvc.time();
    const map = new Map<string, LineStatus>();
    this.groupedLines.forEach(group => {
      group.lines.forEach(line => {
        map.set(line, this.scheduleSvc.getLineStatus(line, time));
      });
    });
    return map;
  });

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
