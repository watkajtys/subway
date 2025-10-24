import { Pipe, PipeTransform, inject } from '@angular/core';
import { DestinationMappingService } from './destination-mapping.service';

@Pipe({
  name: 'destination',
  standalone: true,
})
export class DestinationPipe implements PipeTransform {
  private readonly destinationMappingService = inject(DestinationMappingService);

  transform(
    routeId: string | null | undefined,
    direction: 'N' | 'S'
  ): string | undefined {
    if (!routeId) {
      return undefined;
    }

    const destination = this.destinationMappingService.getDestination(routeId, direction);
    return destination?.toUpperCase();
  }
}
