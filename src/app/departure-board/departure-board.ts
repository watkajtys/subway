import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  computed,
  effect,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { StateService, ArrivalTime } from '../state.service';
import Long from 'long';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { DestinationPipe } from '../destination.pipe';
import { RouterModule } from '@angular/router';
import { StopNameService, Station } from '../stop-name.service';
import { StopNamePipe } from '../stop-name.pipe';

@Component({
  selector: 'app-departure-board',
  imports: [
    CommonModule,
    RouteBadgeComponent,
    ArrivalTimePipe,
    DestinationPipe,
    RouterModule,
    StopNamePipe,
  ],
  templateUrl: './departure-board.html',
})
export class DepartureBoardComponent implements OnInit, OnDestroy {
  private clockInterval?: number;
  private blinkerInterval?: number;
  public state: StateService = inject(StateService);
  private stopNameService: StopNameService = inject(StopNameService);

  protected activeFilter = signal<'all' | 'northbound' | 'southbound'>('all');

  protected filteredArrivals = computed(() => {
    const nowInSeconds = this.state.time().getTime() / 1000;
    const tripUpdatesMap = this.state.tripUpdatesMap();

    const upcoming = this.state
      .arrivalTimes()
      .filter((a) => {
        const tripUpdate = tripUpdatesMap.get(a.tripId);
        const stopTimeUpdate = tripUpdate?.stopTimeUpdate?.find(
          (stu) => stu.stopId === a.stopId
        );
        const departureTime = this.convertToNumber(
          stopTimeUpdate?.departure?.time
        );

        // Use departure time if available, otherwise fall back to arrival time.
        const effectiveTime = departureTime ?? a.arrivalTime;
        return effectiveTime > nowInSeconds;
      })
      .sort((a, b) => a.arrivalTime! - b.arrivalTime!);

    const filter = this.activeFilter();

    if (filter === 'all') {
      return upcoming;
    }
    return upcoming.filter((a) =>
      filter === 'northbound' ? a.direction === 'N' : a.direction === 'S'
    );
  });

  constructor() {
    effect(() => {
      // Re-fetch arrivals when selected station changes
      this.state.selectedStation();
      this.state.fetchArrivals();
    });
  }

  protected stations: Station[] = [];

  ngOnInit() {
    this.stations = this.stopNameService.getStations();
  }

  ngOnDestroy() {}

  protected onStationChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.state.selectedStation.set(target.value);
  }

  protected setFilter(filter: 'all' | 'northbound' | 'southbound') {
    this.activeFilter.set(filter);
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
