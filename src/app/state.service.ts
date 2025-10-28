import { Injectable, signal, inject } from '@angular/core';
import { TripUpdate } from './generated/gtfs-realtime';
import { MtaDataService } from './mta-data.service';
import { StopNameService } from './stop-name.service';
import { Subscription, Observable } from 'rxjs';
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

    let fetcher: Observable<[TripUpdate[], Map<string, Set<string>>]>;

    if (this.stopToRoutesMap().size === 0) {
      // First time loading, fetch all feeds to build the stopToRoutesMap
      fetcher = this.mtaDataService.fetchAllFeeds();
    } else {
      // Subsequent loads, fetch only the feeds for the routes at this station
      const routes = new Set<string>();
      stopIds.forEach((stopId) => {
        this.stopToRoutesMap()
          .get(stopId)
          ?.forEach((route) => routes.add(route));
      });
      fetcher = this.mtaDataService.fetchFeedsForRoutes(Array.from(routes));
    }

    this.arrivalsSub = fetcher.subscribe(
      ([allUpdates, newStopToRoutesMap]) => {
        // First, update the stop-to-routes map. This is crucial for subsequent fetches.
        const currentStopToRoutesMap = new Map(this.stopToRoutesMap());
        newStopToRoutesMap.forEach((routes, stopId) => {
          currentStopToRoutesMap.set(stopId, routes);
        });
        this.stopToRoutesMap.set(currentStopToRoutesMap);

        // Identify the routes included in this fresh data payload.
        const routesInThisUpdate = new Set<string>();
        allUpdates.forEach((tu) => {
          if (tu.trip?.routeId) {
            routesInThisUpdate.add(tu.trip.routeId);
          }
        });

        // Create a new map for trip updates.
        const newTripUpdatesMap = new Map<string, TripUpdate>();

        // 1. Copy over all trips that are *not* on the routes we're updating.
        this.tripUpdatesMap().forEach((tripUpdate, tripId) => {
          if (!routesInThisUpdate.has(tripUpdate.trip?.routeId ?? '')) {
            newTripUpdatesMap.set(tripId, tripUpdate);
          }
        });

        // 2. Add all the new trips from the fresh data.
        allUpdates.forEach((tripUpdate) => {
          if (tripUpdate.trip?.tripId) {
            newTripUpdatesMap.set(tripUpdate.trip.tripId, tripUpdate);
          }
        });

        // Atomically update the signal with the new map.
        this.tripUpdatesMap.set(newTripUpdatesMap);

        // Now, re-calculate the arrival times for the selected station based on the new state.
        const newArrivalTimes = Array.from(newTripUpdatesMap.values())
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
      }
    );
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
