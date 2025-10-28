import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StateService } from '../state.service';
import { TransfersService } from '../transfers.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { StopNamePipe } from '../stop-name.pipe';
import { DestinationPipe } from '../destination.pipe';

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
  protected state: StateService = inject(StateService);
  private transfersService: TransfersService = inject(TransfersService);
  private tripId = this.route.snapshot.paramMap.get('id');

  protected getTransfersForStop(stopId: string): string[] {
    return this.transfersService.getTransfers(stopId) ?? [];
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

  protected futureStops = computed(() => {
    const trip = this.trip();
    if (!trip || !trip.stopTimeUpdate) {
      return [];
    }

    const nowInSeconds = this.state.time().getTime() / 1000;

    return trip.stopTimeUpdate.filter(
      (stu: any) => (stu.arrival?.time ?? 0) > nowInSeconds
    );
  });
}
