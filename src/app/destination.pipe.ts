import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'destination',
  standalone: true,
})
export class DestinationPipe implements PipeTransform {
  transform(
    routeId: string | null | undefined,
    direction: 'N' | 'S'
  ): string | undefined {
    if (!routeId) {
      return undefined;
    }

    const destinations = {
      '1': { N: 'Van Cortlandt Park-242 St', S: 'South Ferry' },
      '2': { N: 'Wakefield-241 St', S: 'Flatbush Av-Brooklyn College' },
      '3': { N: 'Harlem-148 St', S: 'New Lots Av' },
      '4': { N: 'Woodlawn', S: 'Utica Av' },
      '5': { N: 'Eastchester-Dyre Av', S: 'Flatbush Av-Brooklyn College' },
      '6': { N: 'Pelham Bay Park', S: 'Brooklyn Bridge-City Hall' },
      '7': { N: 'Flushing-Main St', S: '34 St-Hudson Yards' },
      A: { N: 'Inwood-207 St', S: 'Far Rockaway-Mott Av' },
      C: { N: '168 St', S: 'Euclid Av' },
      E: { N: 'Jamaica Center-Parsons/Archer', S: 'World Trade Center' },
      N: { N: 'Astoria-Ditmars Blvd', S: 'Coney Island-Stillwell Av' },
      Q: { N: '96 St', S: 'Coney Island-Stillwell Av' },
      R: { N: 'Forest Hills-71 Av', S: 'Bay Ridge-95 St' },
      W: { N: 'Astoria-Ditmars Blvd', S: 'Whitehall St' },
    };

    const routeDestinations =
      destinations[routeId as keyof typeof destinations];
    return routeDestinations
      ? routeDestinations[direction].toUpperCase()
      : undefined;
  }
}
