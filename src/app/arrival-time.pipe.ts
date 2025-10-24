import { Pipe, PipeTransform, inject } from '@angular/core';
import { StateService } from './state.service';

@Pipe({
  name: 'arrivalTime',
  standalone: true,
})
export class ArrivalTimePipe implements PipeTransform {
  private state: StateService = inject(StateService);

  transform(arrival: number): string {
    const nowInSeconds = this.state.time().getTime() / 1000;
    const diffInSeconds = arrival - nowInSeconds;
    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes < 1) {
      return 'NOW';
    }

    return `${diffInMinutes} min`;
  }
}
