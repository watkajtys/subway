import { Component, computed, effect, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs/operators';

import { MtaColorsService } from '../mta-colors.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { StateService } from '../state.service';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { HeaderComponent } from '../header/header';
import { TripUpdate_StopTimeUpdate } from '../generated/gtfs-realtime';
import { RealtimeService, RealtimeStop } from '../realtime.service';

type Direction = 'N' | 'S';

@Component({
  selector: 'app-line-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouteBadgeComponent,
    ArrivalTimePipe,
    HeaderComponent,
  ],
  templateUrl: './line-view.html',
  styleUrl: './line-view.css',
})
export class LineViewComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly mtaColorsSvc = inject(MtaColorsService);
  protected readonly stateSvc = inject(StateService);
  private readonly realtimeSvc = inject(RealtimeService);

  // Direction can be 'N' (Northbound) or 'S' (Southbound)
  protected direction = signal<Direction>('N');

  lineId = toSignal(
    this.route.paramMap.pipe(map((params) => params.get('id')))
  );

  lineData = computed(() => {
    const lineId = this.lineId();
    if (!lineId) return null;
    return this.realtimeSvc.getLineData(lineId);
  });

  stations = computed<RealtimeStop[]>(() => {
    const data = this.lineData();
    if (!data) return [];
    return this.direction() === 'N' ? data.northbound : data.southbound;
  });

  constructor() {
    effect(
      (onCleanup) => {
        const line = this.lineId();
        if (line) {
          this.stateSvc.registerLine(line);
        }

        onCleanup(() => {
          if (line) {
            this.stateSvc.unregisterLine(line);
          }
        });
      },
      { allowSignalWrites: true }
    );

    // Auto-switch direction if the default is empty
    effect(() => {
      const data = this.lineData();
      if (!data) return;

      if (this.direction() === 'N' && data.northbound.length === 0 && data.southbound.length > 0) {
        this.direction.set('S');
      } else if (this.direction() === 'S' && data.southbound.length === 0 && data.northbound.length > 0) {
        this.direction.set('N');
      }
    }, { allowSignalWrites: true });
  }

  private readonly upcomingArrivals = computed(() => {
    const tripUpdatesMap = this.stateSvc.tripUpdatesMap();
    const now = this.stateSvc.time();
    const lineId = this.lineId();
    if (!tripUpdatesMap || !lineId) return new Map<string, number>();

    const upcoming = new Map<string, number>();

    for (const update of tripUpdatesMap.values()) {
      if (update.trip?.routeId !== lineId) {
        continue;
      }
      for (const stu of update.stopTimeUpdate ?? []) {
        const arrivalTime = stu.arrival?.time;
        if (arrivalTime && arrivalTime > now.getTime() / 1000) {
          if (!upcoming.has(stu.stopId!) || arrivalTime < upcoming.get(stu.stopId!)!) {
            upcoming.set(stu.stopId!, arrivalTime);
          }
        }
      }
    }
    return upcoming;
  });

  arrivalTimes = computed(() => {
    const stations = this.stations();
    if (!stations) return null;

    const upcoming = this.upcomingArrivals();
    const arrivalTimeMap = new Map<string, { N?: number; S?: number }>();

    for (const station of stations) {
      const stationArrivals: { N?: number; S?: number } = {};
      const northStopId = station.stationId;
      const southStopId = station.stationId.slice(0, -1) + 'S';

      const nextNorth = upcoming.get(northStopId);
      const nextSouth = upcoming.get(southStopId);

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
