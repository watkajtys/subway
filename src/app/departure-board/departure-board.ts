import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  computed,
  effect,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtaDataService } from '../mta-data.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { StateService, ArrivalTime } from '../state.service';
import { Subscription } from 'rxjs';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { DestinationPipe } from '../destination.pipe';
import { RouterModule } from '@angular/router';
import Long from 'long';
import { NyctStopTimeUpdate } from '../generated/nyct-subway';
import { StopNameService, Station } from '../stop-name.service';

@Component({
  selector: 'app-departure-board',
  imports: [
    CommonModule,
    RouteBadgeComponent,
    ArrivalTimePipe,
    DestinationPipe,
    RouterModule,
  ],
  templateUrl: './departure-board.html',
  styleUrl: './departure-board.css',
})
export class DepartureBoardComponent implements OnInit, OnDestroy {
  private refreshInterval?: number;
  private clockInterval?: number;
  private blinkerInterval?: number;
  public state: StateService = inject(StateService);
  private mtaDataService: MtaDataService = inject(MtaDataService);
  private stopNameService: StopNameService = inject(StopNameService);
  private arrivalsSub?: Subscription;

  protected stations: Station[] = [];

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

  constructor() {
    effect(() => {
      // Re-fetch arrivals when selected station changes
      this.state.selectedStation();
      this.fetchArrivals();
    });
  }

  ngOnInit() {
    this.stations = this.stopNameService.getStations();

    this.refreshInterval = window.setInterval(() => this.fetchArrivals(), 15000);
    this.clockInterval = window.setInterval(
      () => this.state.time.set(new Date()),
      1000
    );
    this.blinkerInterval = window.setInterval(
      () => this.state.blinker.update((v) => !v),
      500
    );
  }

  private fetchArrivals() {
    const stopIds = this.stopNameService.getStopIdsForStation(
      this.state.selectedStation()
    );
    if (!stopIds) {
      return;
    }

    this.arrivalsSub = this.mtaDataService
      .fetchAllFeeds()
      .subscribe(([allUpdates, stopToRoutesMap]) => {
        this.state.stopToRoutesMap.set(stopToRoutesMap);
        const newTripUpdatesMap = new Map(
          allUpdates
            .filter((tu) => tu.trip?.tripId)
            .map((tu) => [tu.trip!.tripId!, tu])
        );
        this.state.tripUpdatesMap.set(newTripUpdatesMap);

        const newArrivalTimes = allUpdates
          .map((tripUpdate) => {
            const { trip } = tripUpdate;
            const routeId = trip?.routeId;

            const stop = tripUpdate.stopTimeUpdate?.find(
              (update) =>
                update.stopId &&
                stopIds.some((stop) => update.stopId?.startsWith(stop))
            );

            if (!stop || !trip?.tripId || !routeId) {
              return null;
            }

            const arrivalTime = this.convertToNumber(stop.arrival?.time);
            const nyctStopTimeUpdate = (stop as any)?.[
              '[transit_realtime.nyctStopTimeUpdate]'
            ] as NyctStopTimeUpdate | undefined;
            const direction = stop.stopId!.slice(-1) as 'N' | 'S';

            return {
              tripId: trip.tripId!,
              stopId: stop.stopId!,
              arrivalTime: arrivalTime!,
              routeId: routeId!,
              direction: direction,
              track:
                nyctStopTimeUpdate?.actualTrack ??
                nyctStopTimeUpdate?.scheduledTrack ??
                undefined,
            };
          })
          .filter((a) => a !== null && a.arrivalTime !== undefined);
        this.state.arrivalTimes.set(newArrivalTimes as ArrivalTime[]);
      });
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

  protected onStationChange(event: Event) {
    const target = event.target as HTMLSelectElement;
    this.state.selectedStation.set(target.value);
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
