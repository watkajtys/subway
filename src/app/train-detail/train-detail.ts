import { Component, inject, computed, signal, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { StateService } from '../state.service';
import { TransfersService } from '../transfers.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { StopNamePipe } from '../stop-name.pipe';
import { DestinationPipe } from '../destination.pipe';
import { AccessibilityService } from '../accessibility.service';
import { MtaColorsService } from '../mta-colors.service';
import { TripUpdate_StopTimeUpdate } from '../generated/gtfs-realtime';

@Component({
  selector: 'app-train-detail',
  imports: [
    CommonModule,
    RouterModule,
    RouteBadgeComponent,
    ArrivalTimePipe,
    StopNamePipe,
    DestinationPipe,
  ],
  templateUrl: './train-detail.html',
  styleUrl: './train-detail.css',
})
export class TrainDetailComponent {
  private baselineAllStops = signal<TripUpdate_StopTimeUpdate[] | undefined>(undefined);
  protected accumulatedPastStops = computed(() => {
    const baseline = this.baselineAllStops();
    if (!baseline) {
      return [];
    }
    const futureStopIds = new Set(this.futureStops().map(s => s.stopId));
    return baseline.filter(s => !futureStopIds.has(s.stopId));
  });

  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  protected state: StateService = inject(StateService);
  private transfersService: TransfersService = inject(TransfersService);
  private stopNamePipe = inject(StopNamePipe);
  private tripId = this.route.snapshot.paramMap.get('id');
  private accessibilityService = inject(AccessibilityService);
  private mtaColorsService = inject(MtaColorsService);

  constructor() {
    effect(() => {
      const all = this.allStops();
      if (all.length > 0 && !this.baselineAllStops()) {
        this.baselineAllStops.set(all);
      }
    });
  }

  protected onStationClick(stopId: string) {
    const stationName = this.stopNamePipe.transform(stopId);
    this.state.selectedStation.set(stationName);
    this.router.navigate(['/']);
  }

  protected getTransfersForStop(stopId: string): string[] {
    const parentStopId = stopId.slice(0, -1);
    const allTransfers = this.transfersService.getTransfers(parentStopId) ?? [];
    const currentRouteId = this.trip()?.trip?.routeId;
    if (currentRouteId) {
      return allTransfers.filter((routeId) => routeId !== currentRouteId);
    }
    return allTransfers;
  }

  isAccessible(stopId: string): boolean {
    const parentStopId = stopId.slice(0, -1);
    return this.accessibilityService.isAccessible(parentStopId);
  }

  protected trip = computed(() => {
    if (!this.tripId) {
      return undefined;
    }
    return this.state.tripUpdatesMap().get(this.tripId);
  });

  protected direction = computed(() => {
    const futureStops = this.futureStops();
    if (futureStops.length === 0) {
      return '';
    }
    return futureStops[0].stopId!.slice(-1) as 'N' | 'S';
  });

  protected trainId = computed(() => {
    return this.trip()?.trip?.tripId ?? '';
  });

  protected routeId = computed(() => {
    return this.trip()?.trip?.routeId ?? '';
  });

  protected lineColor = computed(() => {
    return this.mtaColorsService.getColor(this.routeId());
  });

  private allStops = computed(() => {
    const trip = this.trip();
    if (!trip || !trip.stopTimeUpdate) {
      return [];
    }
    return trip.stopTimeUpdate;
  });

  protected futureStops = computed((): TripUpdate_StopTimeUpdate[] => {
    const nowInSeconds = this.state.time().getTime() / 1000;

    return this.allStops().filter(
      (stu) => (stu.departure?.time ?? stu.arrival?.time ?? 0) > nowInSeconds
    );
  });

  protected pastStops = computed((): TripUpdate_StopTimeUpdate[] => {
    const nowInSeconds = this.state.time().getTime() / 1000;

    return this.allStops().filter(
      (stu) => (stu.departure?.time ?? stu.arrival?.time ?? 0) <= nowInSeconds
    );
  });

  protected nextStop = computed(() => {
    return this.futureStops()[0];
  });

  protected isArriving = computed(() => {
    if (!this.nextStop()) {
      return false;
    }
    const arrivalTime = this.nextStop().arrival?.time;
    if (!arrivalTime) {
      return false;
    }
    const nowInSeconds = this.state.time().getTime() / 1000;
    return arrivalTime - nowInSeconds < 60;
  });

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
}
