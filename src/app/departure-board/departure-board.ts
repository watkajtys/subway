import {
  Component,
  OnInit,
  inject,
  computed,
  signal,
  OnDestroy,
} from '@angular/core';
import { MetaService } from '../meta.service';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule, Router } from '@angular/router';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { StateService, ArrivalTime } from '../state.service';
import Long from 'long';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { DestinationPipe } from '../destination.pipe';
import { HeaderComponent } from '../header/header';
import { StopNameService } from '../stop-name.service';
import { Favorite, FavoritesService } from '../favorites.service';
import { RealtimeService } from '../realtime.service';

@Component({
  selector: 'app-departure-board',
  imports: [
    CommonModule,
    RouteBadgeComponent,
    ArrivalTimePipe,
    DestinationPipe,
    RouterModule,
    HeaderComponent,
  ],
  templateUrl: './departure-board.html',
  standalone: true,
})
export class DepartureBoardComponent implements OnInit, OnDestroy {
  public state: StateService = inject(StateService);
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  private metaService: MetaService = inject(MetaService);
  protected stopNameService: StopNameService = inject(StopNameService);
  protected favoritesService: FavoritesService = inject(FavoritesService);
  private realtimeService: RealtimeService = inject(RealtimeService);

  protected activeFilter = signal<'all' | 'northbound' | 'southbound'>('all');
  protected activeLineFilter = signal<string>('all');
  private stationName: string | null = null;

  protected availableLines = computed(() => {
    const stationName = this.state.selectedStation();
    if (!stationName) {
      return [];
    }

    const stopIds = this.stopNameService.getStopIdsForStation(stationName);
    if (!stopIds) {
      return [];
    }

    const routes = new Set<string>();
    const stopToRoutesMap = this.state.stopToRoutesMap();

    for (const id of stopIds) {
      const northId = `${id}N`;
      const southId = `${id}S`;
      stopToRoutesMap.get(northId)?.forEach((r) => routes.add(r));
      stopToRoutesMap.get(southId)?.forEach((r) => routes.add(r));
    }
    return Array.from(routes).sort();
  });

  protected filteredArrivals = computed(() => {
    const nowInSeconds = this.state.time().getTime() / 1000;
    const tripUpdatesMap = this.state.tripUpdatesMap();

    const upcoming = this.state
      .arrivalTimes()
      .filter((a) => {
        const tripUpdate = tripUpdatesMap.get(a.tripId);
        const stopTimeUpdate = tripUpdate?.stopTimeUpdate?.find(
          (stu) => stu.stopId === a.stopId,
        );
        const departureTime = this.convertToNumber(
          stopTimeUpdate?.departure?.time,
        );

        // Use departure time if available, otherwise fall back to arrival time.
        const effectiveTime = departureTime ?? a.arrivalTime;
        return effectiveTime > nowInSeconds;
      })
      .sort((a, b) => a.arrivalTime! - b.arrivalTime!);

    const directionFilter = this.activeFilter();
    const lineFilter = this.activeLineFilter();

    let filtered = upcoming;

    if (directionFilter !== 'all') {
      filtered = filtered.filter((a) =>
        directionFilter === 'northbound'
          ? a.direction === 'N'
          : a.direction === 'S',
      );
    }

    if (lineFilter !== 'all') {
      filtered = filtered.filter((a) => a.routeId === lineFilter);
    }

    return filtered;
  });

  protected isFavoriteEnabled = computed(() => {
    const directionFilter = this.activeFilter();
    if (directionFilter === 'all') {
      return false;
    }

    const lineFilter = this.activeLineFilter();
    const singleLineAvailable = this.availableLines().length === 1;

    return lineFilter !== 'all' || singleLineAvailable;
  });

  protected isFavorite = computed(() => {
    const lineFilter = this.activeLineFilter();
    const direction = this.activeFilter();
    const stationId = this.state.selectedStation();
    const availableLines = this.availableLines();
    this.favoritesService.favorites(); // Ensure this signal is tracked

    let lineId = lineFilter;
    if (lineFilter === 'all' && availableLines.length === 1) {
      lineId = availableLines[0];
    }

    if (lineId === 'all' || direction === 'all' || !stationId) {
      return false;
    }

    const favorite: Favorite = {
      stationId: stationId,
      lineId: lineId,
      direction: direction === 'northbound' ? 'Uptown' : 'Downtown',
    };
    return this.favoritesService.isFavorite(favorite);
  });

  ngOnInit() {
    this.route.params.subscribe((params) => {
      this.stationName = decodeURIComponent(params['id']);
      if (this.stationName) {
        const title = `${this.stationName} | Did I Miss My Train?`;
        this.metaService.updateTags(
          title,
          "Live MTA subway departure times for New York City",
          this.router.url
        );
        this.state.selectedStation.set(this.stationName);
        this.state.registerStation(this.stationName);
      }
    });

    this.route.queryParams.subscribe((queryParams) => {
      const line = queryParams['line'];
      const direction = queryParams['direction'];

      this.activeLineFilter.set(line ?? 'all');

      if (direction === 'Uptown') {
        this.activeFilter.set('northbound');
      } else if (direction === 'Downtown') {
        this.activeFilter.set('southbound');
      } else {
        this.activeFilter.set('all');
      }
    });
  }

  ngOnDestroy() {
    if (this.stationName) {
      this.state.unregisterStation(this.stationName);
    }
  }

  toggleFavorite() {
    const lineFilter = this.activeLineFilter();
    const direction = this.activeFilter();
    const stationId = this.state.selectedStation();
    const availableLines = this.availableLines();

    let lineId = lineFilter;
    if (lineFilter === 'all' && availableLines.length === 1) {
      lineId = availableLines[0];
    }

    if (lineId === 'all' || direction === 'all' || !stationId) {
      return;
    }

    const favorite: Favorite = {
      stationId: stationId,
      lineId: lineId,
      direction: direction === 'northbound' ? 'Uptown' : 'Downtown',
    };

    this.favoritesService.toggleFavorite(favorite);
  }

  protected setFilter(filter: 'all' | 'northbound' | 'southbound') {
    this.activeFilter.set(filter);
    this.updateUrlQueryParams();
  }

  protected setLineFilter(line: string) {
    this.activeLineFilter.set(line);
    this.updateUrlQueryParams();
  }

  private updateUrlQueryParams() {
    const queryParams: { [key: string]: string } = {};

    const line = this.activeLineFilter();
    if (line !== 'all') {
      queryParams['line'] = line;
    }

    const direction = this.activeFilter();
    if (direction === 'northbound') {
      queryParams['direction'] = 'Uptown';
    } else if (direction === 'southbound') {
      queryParams['direction'] = 'Downtown';
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams,
    });
  }

  protected getTimeStyles(arrival: number | undefined): {
    [key: string]: string;
  } {
    if (arrival === undefined) {
      return {};
    }

    const nowInSeconds = this.state.time().getTime() / 1000;
    const diffInSeconds = arrival - nowInSeconds;

    if (diffInSeconds < 30) {
      return {
        color: '#00ff00', // Bright Green
        opacity: this.state.blinker() ? '1' : '0.2',
        transition: 'opacity 0.2s ease-in-out',
      };
    }

    if (diffInSeconds < 60) {
      return { color: '#fb923c' }; // Bright Orange
    }

    if (diffInSeconds < 120) {
      return { color: '#fdd835' }; // Bright Yellow
    }

    return {};
  }

  protected trackByTripId(index: number, arrival: ArrivalTime): string {
    return arrival.tripId;
  }

  private convertToNumber(
    value: number | Long | null | undefined,
  ): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'number') {
      return value;
    }
    return value.toNumber();
  }
}
