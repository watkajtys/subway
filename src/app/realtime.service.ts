import { Injectable, computed, inject } from '@angular/core';
import { StateService, TripUpdate } from './state.service';
import { StopNameService } from './stop-name.service';

export interface RealtimeStop {
  stationId: string;
  name: string;
  transfers: string[];
  isExpress: boolean;
}

export interface RealtimeLineData {
  northbound: RealtimeStop[];
  southbound: RealtimeStop[];
}

@Injectable({
  providedIn: 'root',
})
export class RealtimeService {
  private state = inject(StateService);
  private stopNameService = inject(StopNameService);

  // This computed signal will process the raw trip updates into a structured
  // map of line data, keyed by routeId. This is the core of our new architecture.
  private linesSignal = computed<Map<string, RealtimeLineData>>(() => {
    const tripUpdates = this.state.tripUpdatesMap();
    const stopToRoutesMap = this.state.stopToRoutesMap();
    const lines = new Map<string, RealtimeLineData>();

    // Step 1: Group trips by route and direction
    const tripsByRouteDirection = new Map<string, TripUpdate[]>();
    for (const tripUpdate of tripUpdates.values()) {
      const routeId = tripUpdate.trip?.routeId;
      const tripId = tripUpdate.trip?.tripId;
      if (!routeId || !tripId || !tripUpdate.stopTimeUpdate) {
        continue;
      }
      // Determine direction from tripId (e.g., 'A20220610WKD_000800_A..S')
      const direction = tripId.includes('..S') ? 'S' : 'N';
      const key = `${routeId}-${direction}`;
      if (!tripsByRouteDirection.has(key)) {
        tripsByRouteDirection.set(key, []);
      }
      tripsByRouteDirection.get(key)!.push(tripUpdate);
    }

    // Step 2: For each route and direction, find the most common stop sequence
    for (const [key, trips] of tripsByRouteDirection.entries()) {
      const [routeId, direction] = key.split('-');
      const stopSequences = new Map<string, number>();
      for (const trip of trips) {
        const sequence = trip.stopTimeUpdate!.map((stu) => stu.stopId!).join(
          ','
        );
        stopSequences.set(sequence, (stopSequences.get(sequence) ?? 0) + 1);
      }

      let mostCommonSequence: string[] = [];
      if (stopSequences.size > 0) {
        const sortedSequences = [...stopSequences.entries()].sort(
          (a, b) => b[1] - a[1]
        );
        mostCommonSequence = sortedSequences[0][0].split(',');
      }

      // Step 3: Build the RealtimeStop objects for this sequence
      const stops: RealtimeStop[] = mostCommonSequence.map((stopId) => {
        const routes = this.getActiveTransfers(stopId);
        return {
          stationId: stopId,
          name: this.stopNameService.getStopName(stopId) ?? 'Unknown Station',
          transfers: routes,
          // Placeholder for express logic - for now, all stops are local
          isExpress: false,
        };
      });

      // Step 4: Store the data
      if (!lines.has(routeId)) {
        lines.set(routeId, { northbound: [], southbound: [] });
      }
      const lineData = lines.get(routeId)!;
      if (direction === 'N') {
        lineData.northbound = stops;
      } else {
        lineData.southbound = stops;
      }
    }

    return lines;
  });

  public getLineData(routeId: string): RealtimeLineData | undefined {
    return this.linesSignal().get(routeId);
  }

  public getActiveTransfers(stopId: string): string[] {
    const stopIds = this.stopNameService.getStopIdsForStationComplex(stopId);
    const routes = new Set<string>();
    for (const id of stopIds) {
      // check for routes at each platform in the complex
      const northId = `${id}N`;
      const southId = `${id}S`;
      this.state.stopToRoutesMap().get(northId)?.forEach(r => routes.add(r));
      this.state.stopToRoutesMap().get(southId)?.forEach(r => routes.add(r));
    }
    return Array.from(routes);
  }
}
