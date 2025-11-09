import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { Favorite } from '../favorites.service';
import { StateService } from '../state.service';
import { ArrivalTimePipe } from '../arrival-time.pipe';
import { DestinationPipe } from '../destination.pipe';

@Component({
  selector: 'app-favorite-card',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouteBadgeComponent,
    ArrivalTimePipe,
    DestinationPipe,
  ],
  templateUrl: './favorite-card.html',
  styleUrls: ['./favorite-card.css'],
})
export class FavoriteCardComponent {
  @Input({ required: true }) favorite!: Favorite;
  private state = inject(StateService);

  protected stationName = computed(() => {
    return this.favorite.stationId;
  });

  protected nextArrivals = computed(() => {
    const nowInSeconds = this.state.time().getTime() / 1000;
    const stopIds = this.state.stopNameService.getStopIdsForStation(
      this.favorite.stationId,
    );
    const direction = this.favorite.direction === 'Uptown' ? 'N' : 'S';

    return this.state
      .arrivalTimes()
      .filter(
        (a) =>
          a.routeId === this.favorite.lineId &&
          a.direction === direction &&
          stopIds?.includes(a.stopId),
      )
      .filter((a) => a.arrivalTime > nowInSeconds)
      .sort((a, b) => a.arrivalTime - b.arrivalTime)
      .slice(0, 2);
  });
}
