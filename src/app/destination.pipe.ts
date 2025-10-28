import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'destination',
})
export class DestinationPipe implements PipeTransform {
  private destinations: { [key: string]: { N: string; S: string } } = {
    '1': { N: 'Van Cortlandt Park-242 St', S: 'South Ferry' },
    '2': { N: 'Wakefield-241 St', S: 'Flatbush Av-Brooklyn College' },
    '3': { N: 'Harlem-148 St', S: 'New Lots Av' },
    '4': { N: 'Woodlawn', S: 'Crown Heights-Utica Av' },
    '5': { N: 'Eastchester-Dyre Av', S: 'Flatbush Av-Brooklyn College' },
    '6': { N: 'Pelham Bay Park', S: 'Brooklyn Bridge-City Hall' },
    '7': { N: 'Flushing-Main St', S: '34 St-Hudson Yards' },
    A: { N: 'Inwood-207 St', S: 'Ozone Park-Lefferts Blvd' },
    C: { N: '168 St', S: 'Euclid Av' },
    E: { N: 'Jamaica Center-Parsons/Archer', S: 'World Trade Center' },
    B: { N: '145 St', S: 'Brighton Beach' },
    D: { N: 'Norwood-205 St', S: 'Coney Island-Stillwell Av' },
    F: { N: 'Jamaica-179 St', S: 'Coney Island-Stillwell Av' },
    M: { N: 'Forest Hills-71 Av', S: 'Middle Village-Metropolitan Av' },
    G: { N: 'Court Sq', S: 'Church Av' },
    J: { N: 'Jamaica Center-Parsons/Archer', S: 'Broad St' },
    Z: { N: 'Jamaica Center-Parsons/Archer', S: 'Broad St' },
    L: { N: 'Canarsie-Rockaway Pkwy', S: '8 Av' },
    N: { N: 'Astoria-Ditmars Blvd', S: 'Coney Island-Stillwell Av' },
    Q: { N: '96 St', S: 'Coney Island-Stillwell Av' },
    R: { N: 'Forest Hills-71 Av', S: 'Bay Ridge-95 St' },
    W: { N: 'Astoria-Ditmars Blvd', S: 'Whitehall St' },
    S: { N: 'Franklin Av', S: 'Rockaway Park' },
    GS: { N: 'Grand Central-42 St', S: 'Times Sq-42 St' },
  };

  transform(value: string, direction: 'N' | 'S' | ''): string {
    if (!direction) {
      return 'N/A';
    }
    const routeDestinations = this.destinations[value];
    return routeDestinations?.[direction] ?? 'N/A';
  }
}
