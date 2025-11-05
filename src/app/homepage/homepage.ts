import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from '../header/header';
import { MtaColorsService } from '../mta-colors.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { Router, RouterModule } from '@angular/router';
import { StopNameService } from '../stop-name.service';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [
    CommonModule,
    HeaderComponent,
    RouteBadgeComponent,
    RouterModule,
  ],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class HomepageComponent {
  protected colors = inject(MtaColorsService);
  private router = inject(Router);
  private stopNameService = inject(StopNameService);
  protected groupedLines = this.colors.getGroupedLines();
  protected stations = this.stopNameService.getStations();

  searchTerm = signal('');

  filteredStations = computed(() => {
    const term = this.searchTerm().toLowerCase();
    if (!term) {
      return [];
    }
    return this.stations.filter((station: { name: string }) =>
      station.name.toLowerCase().includes(term)
    );
  });

  navigateToStation(stationName: string) {
    this.router.navigate(['/station', stationName]);
  }

  handleSearch(event: Event) {
    const term = (event.target as HTMLInputElement).value;
    this.searchTerm.set(term);
  }

  constructor() {}
}
