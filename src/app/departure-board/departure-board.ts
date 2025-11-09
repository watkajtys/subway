import {
  Component,
  OnInit,
  inject,
  computed,
  signal,
  OnDestroy,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { StateService, ArrivalTime } from '../state.service';
import Long from 'long';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { DestinationPipe } from '../destination.pipe';
import { HeaderComponent } from '../header/header';
import { StopNameService } from '../stop-name.service';
import { Favorite, FavoritesService } from '../favorites.service';

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
  protected stopNameService: StopNameService = inject(StopNameService);
  protected favoritesService: FavoritesService = inject(FavoritesService);

  protected activeFilter = signal<'all' | 'northbound' | 'southbound'>('all');
  protected activeLineFilter = signal<string>('all');
  private stationName: string | null = null;

  protected availableLines = computed(() => {
    const arrivals = this.state.arrivalTimes();
    const lines = new Set(arrivals.map((a) => a.routeId));
    return Array.from(lines).sort();
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
    return this.activeLineFilter() !== 'all' && this.activeFilter() !== 'all';
  });

  protected isFavorite = computed(() => {
    const lineId = this.activeLineFilter();
    const direction = this.activeFilter();
    const stationId = this.state.selectedStation();

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
        this.state.selectedStation.set(this.stationName);
        this.state.registerStation(this.stationName);
      }
    });
  }

  ngOnDestroy() {
    if (this.stationName) {
      this.state.unregisterStation(this.stationName);
    }
  }

  toggleFavorite() {
    const lineId = this.activeLineFilter();
    const direction = this.activeFilter();
    const stationId = this.state.selectedStation();

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
  }

  protected setLineFilter(line: string) {
    this.activeLineFilter.set(line);
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
    value: number | Long | null | undefined
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
