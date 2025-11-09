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
