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
    const upcoming = this.state
      .arrivalTimes()
      .filter((a) => a.arrivalTime && a.arrivalTime > nowInSeconds)
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

  protected getTimeClass(arrival: number | undefined): {
    [key: string]: boolean;
  } {
    if (arrival === undefined) {
      return {};
    }

    const nowInSeconds = this.state.time().getTime() / 1000;
    const diffInSeconds = arrival - nowInSeconds;
    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 1) {
      return { blink: true, 'blink-on': this.state.blinker() };
    }

    if (diffInMinutes < 2) {
      return { near: true };
    }

    return {};
  }

  protected trackByTripId(index: number, arrival: ArrivalTime): string {
    return arrival.tripId;
  }
}
