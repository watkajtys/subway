import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { StateService } from '../state.service';
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
  private tripId = this.route.snapshot.paramMap.get('id');

  protected trip = computed(() => {
    if (!this.tripId) {
      return undefined;
    }
    return this.state.tripUpdatesMap().get(this.tripId);
  });

  protected direction = computed(() => {
    const trip = this.trip();
    if (!trip) {
      return '';
    }
    return (trip.trip as any)?.nyctTripDescriptor?.direction?.slice(0, 1) ?? '';
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
