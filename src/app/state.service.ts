import { Injectable, signal, inject } from '@angular/core';
import { TripUpdate } from './generated/gtfs-realtime';
import { MtaDataService } from './mta-data.service';
import { StopNameService } from './stop-name.service';
import { Subscription } from 'rxjs';
import Long from 'long';
import { NyctStopTimeUpdate } from './generated/nyct-subway';

export interface ArrivalTime {
  routeId: string;
  tripId: string;
  stopId: string;
  arrivalTime: number;
  direction: 'N' | 'S';
  track?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StateService {
  private mtaDataService: MtaDataService = inject(MtaDataService);
  private stopNameService: StopNameService = inject(StopNameService);
  private arrivalsSub?: Subscription;

  public arrivalTimes = signal<ArrivalTime[]>([]);
  public tripUpdatesMap = signal<Map<string, TripUpdate>>(new Map());
  public stopToRoutesMap = signal<Map<string, Set<string>>>(new Map());
  public time = signal(new Date());
  public blinker = signal(false);
  public selectedStation = signal<string>('Times Sq - 42 St');

  constructor() {
    this.fetchArrivals();
    setInterval(() => this.fetchArrivals(), 15000);
    setInterval(() => this.time.set(new Date()), 1000);
    setInterval(() => this.blinker.update((v) => !v), 500);
  }

  fetchArrivals() {
    const stopIds = this.stopNameService.getStopIdsForStation(
      this.selectedStation()
    );
    if (!stopIds) {
      return;
    }

    this.arrivalsSub = this.mtaDataService
      .fetchAllFeeds()
      .subscribe(([allUpdates, stopToRoutesMap]) => {
        this.stopToRoutesMap.set(stopToRoutesMap);
        const newTripUpdatesMap = new Map(
          allUpdates
            .filter((tu) => tu.trip?.tripId)
            .map((tu) => [tu.trip!.tripId!, tu])
        );
        this.tripUpdatesMap.set(newTripUpdatesMap);

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
        this.arrivalTimes.set(newArrivalTimes as ArrivalTime[]);
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
}
