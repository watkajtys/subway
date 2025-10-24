import {
  Component,
  OnInit,
  OnDestroy,
  signal,
  inject,
  computed,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtaDataService } from './mta-data.service';
import { RouteBadgeComponent } from './route-badge/route-badge';
import { StateService, ArrivalTime } from './state.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouteBadgeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('mta-departure-board');
  private refreshInterval?: number;
  private clockInterval?: number;
  private blinkerInterval?: number;
  public state: StateService = inject(StateService);
  private mtaDataService: MtaDataService = inject(MtaDataService);
  private arrivalsSub?: Subscription;

  protected arrivalsByDirection = computed(() => {
    const nowInSeconds = this.state.time().getTime() / 1000;
    const upcoming = this.state
      .arrivalTimes()
      .filter((a) => a.arrivalTime && a.arrivalTime > nowInSeconds)
      .sort((a, b) => a.arrivalTime! - b.arrivalTime!);

    const northbound = upcoming.filter((a) => a.direction === 'N').slice(0, 10);

    const southbound = upcoming.filter((a) => a.direction === 'S').slice(0, 10);

    return { northbound, southbound };
  });

  ngOnInit() {
    this.fetchArrivals();

    this.refreshInterval = window.setInterval(() => this.fetchArrivals(), 15000);
    this.clockInterval = window.setInterval(
      () => this.state.time.set(new Date()),
      1000
    );
    this.blinkerInterval = window.setInterval(
      () => this.state.blinker.update((v) => !v),
      1000
    );
  }

  private fetchArrivals() {
    this.arrivalsSub = this.mtaDataService
      .fetchAllFeeds()
      .subscribe((allUpdates) => {
        this.state.arrivalTimes.update((currentArrivals) => {
          const arrivalsMap = new Map(
            currentArrivals.map((a) => [a.tripId, a])
          );
          for (const update of allUpdates) {
            arrivalsMap.set(update.tripId, update);
          }
          const newTripIds = new Set(allUpdates.map((a) => a.tripId));
          return Array.from(arrivalsMap.values()).filter((a) =>
            newTripIds.has(a.tripId)
          );
        });
      });
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
    if (this.blinkerInterval) {
      clearInterval(this.blinkerInterval);
    }
    if (this.arrivalsSub) {
      this.arrivalsSub.unsubscribe();
    }
  }

  protected getMinutesUntilArrival(arrival: number): string {
    const nowInSeconds = this.state.time().getTime() / 1000;
    const diffInSeconds = arrival - nowInSeconds;
    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 1) {
      return 'NOW';
    }

    return `${diffInMinutes} min`;
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
      return { blink: this.state.blinker() };
    }

    if (diffInMinutes < 2) {
      return { near: true };
    }

    return {};
  }

  protected trackByTripId(index: number, arrival: ArrivalTime): string {
    return arrival.tripId;
  }
  protected getDestination(
    routeId: string | null | undefined,
    direction: 'N' | 'S'
  ): string | undefined {
    if (!routeId) {
      return undefined;
    }

    const destinations = {
      '1': { N: 'Van Cortlandt Park-242 St', S: 'South Ferry' },
      '2': { N: 'Wakefield-241 St', S: 'Flatbush Av-Brooklyn College' },
      '3': { N: 'Harlem-148 St', S: 'New Lots Av' },
      '4': { N: 'Woodlawn', S: 'Utica Av' },
      '5': { N: 'Eastchester-Dyre Av', S: 'Flatbush Av-Brooklyn College' },
      '6': { N: 'Pelham Bay Park', S: 'Brooklyn Bridge-City Hall' },
      '7': { N: 'Flushing-Main St', S: '34 St-Hudson Yards' },
      A: { N: 'Inwood-207 St', S: 'Far Rockaway-Mott Av' },
      C: { N: '168 St', S: 'Euclid Av' },
      E: { N: 'Jamaica Center-Parsons/Archer', S: 'World Trade Center' },
      N: { N: 'Astoria-Ditmars Blvd', S: 'Coney Island-Stillwell Av' },
      Q: { N: '96 St', S: 'Coney Island-Stillwell Av' },
      R: { N: 'Forest Hills-71 Av', S: 'Bay Ridge-95 St' },
      W: { N: 'Astoria-Ditmars Blvd', S: 'Whitehall St' },
    };

    const routeDestinations =
      destinations[routeId as keyof typeof destinations];
    return routeDestinations
      ? routeDestinations[direction].toUpperCase()
      : undefined;
  }
}
