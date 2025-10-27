import { Pipe, PipeTransform, inject } from '@angular/core';
import { StopNameService } from './stop-name.service';

@Pipe({
  name: 'stopName',
})
export class StopNamePipe implements PipeTransform {
  private stopNameService: StopNameService = inject(StopNameService);

  transform(value: string | undefined): string {
    if (!value) {
      return '';
    }
    return this.stopNameService.getStopName(value) ?? 'Unknown Station';
  }
}
