import { Component, inject, computed } from '@angular/core';
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
  private route: ActivatedRoute = inject(ActivatedRoute);
  private router: Router = inject(Router);
  protected state: StateService = inject(StateService);
  private transfersService: TransfersService = inject(TransfersService);
  private stopNamePipe = inject(StopNamePipe);
  private tripId = this.route.snapshot.paramMap.get('id');
  private accessibilityService = inject(AccessibilityService);
  private mtaColorsService = inject(MtaColorsService);

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
      (stu) => (stu.arrival?.time ?? 0) > nowInSeconds
    );
  });

  protected pastStops = computed((): TripUpdate_StopTimeUpdate[] => {
    const nowInSeconds = this.state.time().getTime() / 1000;

    return this.allStops().filter(
      (stu) => (stu.arrival?.time ?? 0) <= nowInSeconds
    );
  });

  protected nextStop = computed(() => {
    return this.futureStops()[0];
  });

  protected mostRecentPastStop = computed(() => {
    return this.pastStops().slice(-1)[0];
  });
}
