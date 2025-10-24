import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DestinationMappingService {
  private readonly destinationMappings: { [key: string]: { N: string; S: string } } = {
    '1': { N: 'Van Cortlandt Park-242 St', S: 'South Ferry' },
    '2': { N: 'Wakefield-241 St', S: 'Flatbush Av-Brooklyn College' },
    '3': { N: 'Harlem-148 St', S: 'New Lots Av' },
    '4': { N: 'Woodlawn', S: 'Crown Hts-Utica Av' },
    '5': { N: 'Eastchester-Dyre Av', S: 'Flatbush Av-Brooklyn College' },
    '6': { N: 'Pelham Bay Park', S: 'Brooklyn Bridge-City Hall' },
    '7': { N: 'Flushing-Main St', S: '34 St-Hudson Yards' },
    'A': { N: 'Inwood-207 St', S: 'Ozone Park-Lefferts Blvd' },
    'C': { N: '168 St', S: 'Euclid Av' },
    'E': { N: 'Jamaica Center-Parsons/Archer', S: 'World Trade Center' },
    'N': { N: 'Astoria-Ditmars Blvd', S: 'Coney Island-Stillwell Av' },
    'Q': { N: '96 St', S: 'Coney Island-Stillwell Av' },
    'R': { N: 'Forest Hills-71 Av', S: 'Bay Ridge-95 St' },
    'W': { N: 'Astoria-Ditmars Blvd', S: 'Whitehall St' },
    'S': { N: 'Times Sq-42 St', S: 'Grand Central-42 St' },
  };

  public getDestination(routeId: string, direction: 'N' | 'S'): string {
    return this.destinationMappings[routeId]?.[direction] ?? 'N/A';
  }
}
