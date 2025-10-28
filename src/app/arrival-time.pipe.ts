import { Pipe, PipeTransform, inject } from '@angular/core';
import { StateService } from './state.service';

@Pipe({
  name: 'arrivalTime',
  standalone: true,
  pure: false,
})
export class ArrivalTimePipe implements PipeTransform {
  private state: StateService = inject(StateService);

  transform(arrival: number | undefined): string {
    if (arrival === undefined) {
      return 'N/A';
    }
    const nowInSeconds = this.state.time().getTime() / 1000;
    const diffInSeconds = arrival - nowInSeconds;

    if (diffInSeconds < 30) {
      return 'NOW';
    }

    if (diffInSeconds < 60) {
      return 'soon';
    }

    if (diffInSeconds < 120) {
      return '1 min';
    }

    return `${Math.floor(diffInSeconds / 60)} min`;
  }
}
