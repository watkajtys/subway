import { Injectable, signal, inject, computed } from '@angular/core';
import { TripUpdate } from './generated/gtfs-realtime';
export { TripUpdate } from './generated/gtfs-realtime';
import { MtaDataService } from './mta-data.service';
import { StopNameService } from './stop-name.service';
import { Observable } from 'rxjs';
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
  private dataFetchInterval: any = null;

  // Signals for application state
  public tripUpdatesMap = signal<Map<string, TripUpdate>>(new Map());
  public stopToRoutesMap = signal<Map<string, Set<string>>>(new Map());
  public time = signal(new Date());
  public blinker = signal(false);
  public selectedStation = signal<string>('Times Sq - 42 St');

  // Private signals to track active data subscriptions
  private activeStationSubscriptions = signal<Set<string>>(new Set());
  private activeLineSubscriptions = signal<Set<string>>(new Set());

  public arrivalTimes = computed<ArrivalTime[]>(() => {
    const tripUpdates = this.tripUpdatesMap();
    const stationName = this.selectedStation();
    const stopIds = this.stopNameService.getStopIdsForStation(stationName);

    if (!stopIds || tripUpdates.size === 0) {
      return [];
    }

    const newArrivalTimes = Array.from(tripUpdates.values())
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

    return newArrivalTimes as ArrivalTime[];
  });

  constructor() {
    setInterval(() => this.time.set(new Date()), 1000);
    setInterval(() => this.blinker.update((v) => !v), 500);
  }

  public registerStation(stationName: string) {
    this.activeStationSubscriptions.update((subs) => {
      subs.add(stationName);
      return new Set(subs);
    });
    this.manageFetching();
  }

  public unregisterStation(stationName: string) {
    this.activeStationSubscriptions.update((subs) => {
      subs.delete(stationName);
      return new Set(subs);
    });
    this.manageFetching();
  }

  public registerLine(lineId: string) {
    this.activeLineSubscriptions.update((subs) => {
      subs.add(lineId);
      return new Set(subs);
    });
    this.manageFetching();
  }

  public unregisterLine(lineId: string) {
    this.activeLineSubscriptions.update((subs) => {
      subs.delete(lineId);
      return new Set(subs);
    });
    this.manageFetching();
  }

  private manageFetching() {
    const hasSubscriptions =
      this.activeStationSubscriptions().size > 0 ||
      this.activeLineSubscriptions().size > 0;

    if (hasSubscriptions && !this.dataFetchInterval) {
      this.fetchRequiredData(); // Fetch immediately
      this.dataFetchInterval = setInterval(() => this.fetchRequiredData(), 15000);
    } else if (!hasSubscriptions && this.dataFetchInterval) {
      clearInterval(this.dataFetchInterval);
      this.dataFetchInterval = null;
    }
  }

  private fetchRequiredData() {
    this.mtaDataService.fetchAllFeeds().subscribe(([allUpdates, newStopToRoutesMap]) => {
      this.stopToRoutesMap.set(newStopToRoutesMap);
      const newTripUpdatesMap = new Map<string, TripUpdate>();
      allUpdates.forEach((tripUpdate) => {
        if (tripUpdate.trip?.tripId) {
          newTripUpdatesMap.set(tripUpdate.trip.tripId, tripUpdate);
        }
      });
      this.tripUpdatesMap.set(newTripUpdatesMap);
    });
  }

  private convertToNumber(
    value: number | Long | null | undefined
  ): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'number') return value;
    return value.toNumber();
  }
}
