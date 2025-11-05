import { Component, computed, inject } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map, switchMap, tap } from 'rxjs';

import { MtaColorsService } from '../mta-colors.service';
import { StopNamePipe } from '../stop-name.pipe';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { TransfersService } from '../transfers.service';
import { MtaDataService } from '../mta-data.service';
import { StateService } from '../state.service';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { TripUpdate, TripUpdate_StopTimeUpdate } from '../generated/gtfs-realtime';

interface Station {
  stationId: string;
  name: string;
  stops: { [direction: string]: string[] };
  isExpress: boolean;
}

@Component({
  selector: 'app-line-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    StopNamePipe,
    RouteBadgeComponent,
    ArrivalTimePipe,
  ],
  templateUrl: './line-view.html',
  styleUrl: './line-view.css',
})
export class LineViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly http = inject(HttpClient);
  private readonly mtaColorsSvc = inject(MtaColorsService);
  private readonly mtaDataSvc = inject(MtaDataService);
  protected readonly stateSvc = inject(StateService);

  protected readonly transfersSvc = inject(TransfersService);

  lineId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id')))
  );

  stations = toSignal(
    this.route.paramMap.pipe(
      map((params) => params.get('id')),
      switchMap((id) => this.http.get<Station[]>(`/assets/lines/${id}.json`)),
      tap((stations) => {
        const lineId = this.lineId();
        if (lineId) {
          this.mtaDataSvc
            .fetchFeedsForRoutes([lineId])
            .subscribe(([tripUpdates]) => {
              this.stateSvc.tripUpdatesMap.update((currentMap) => {
                tripUpdates.forEach((tu) => {
                  if (tu.trip?.tripId) {
                    currentMap.set(tu.trip.tripId, tu);
                  }
                });
                return new Map(currentMap);
              });
            });
        }
      })
    )
  );

  arrivalTimes = computed(() => {
    const stations = this.stations();
    const tripUpdatesMap = this.stateSvc.tripUpdatesMap();
    const now = this.stateSvc.time();
    if (!stations || !tripUpdatesMap) return null;

    const arrivalTimeMap = new Map<string, { N?: number; S?: number }>();
    const tripUpdates = Array.from(tripUpdatesMap.values());

    for (const station of stations) {
      const stationArrivals: { N?: number; S?: number } = {};
      const northStopIds = station.stops['N'] ?? [];
      const southStopIds = station.stops['S'] ?? [];

      const findNextArrival = (stopIds: string[]) => {
        let nextArrival: number | undefined;
        for (const update of tripUpdates) {
          const stopTimeUpdate = update.stopTimeUpdate?.find(
            (stu: TripUpdate_StopTimeUpdate) =>
              stopIds.includes(stu.stopId ?? '') &&
              (stu.arrival?.time ?? 0) > now.getTime() / 1000
          );
          const arrivalTime = stopTimeUpdate?.arrival?.time;
          if (
            arrivalTime &&
            (nextArrival === undefined || arrivalTime < nextArrival)
          ) {
            nextArrival = arrivalTime;
          }
        }
        return nextArrival;
      };

      const nextNorth = findNextArrival(northStopIds);
      const nextSouth = findNextArrival(southStopIds);

      if (nextNorth) stationArrivals['N'] = nextNorth;
      if (nextSouth) stationArrivals['S'] = nextSouth;

      arrivalTimeMap.set(station.stationId, stationArrivals);
    }

    return arrivalTimeMap;
  });

  lineColor = computed(() => {
    const lineId = this.lineId();
    if (!lineId) return 'inherit';
    return this.mtaColorsSvc.getColor(lineId);
  });
}
