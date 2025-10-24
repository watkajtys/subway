import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MtaData } from './mta-data';
import { transit_realtime } from 'gtfs-realtime-bindings';
import Long from 'long';
import { RouteBadgeComponent } from './route-badge/route-badge';
import { firstValueFrom } from 'rxjs';

interface StopTimeUpdate {
  tripId: string;
  stopId: string;
  arrival?: number;
  departure?: number;
  routeId?: string;
  direction?: 'N' | 'S';
  destination?: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule, RouteBadgeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('mta-departure-board');
  protected arrivalTimes = signal<StopTimeUpdate[]>([]);
  protected time = signal(new Date());
  private refreshInterval?: number;
  private clockInterval?: number;

  protected arrivalsByDirection = computed(() => {
    const nowInSeconds = Date.now() / 1000;
    const upcoming = this.arrivalTimes()
      .filter(a => a.arrival && a.arrival > nowInSeconds)
      .sort((a, b) => a.arrival! - b.arrival!);

    const northbound = upcoming
      .filter(a => a.direction === 'N')
      .slice(0, 10);

    const southbound = upcoming
      .filter(a => a.direction === 'S')
      .slice(0, 10);

    return { northbound, southbound };
  });

  private readonly feedUrls = [
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',       // 1, 2, 3, 4, 5, 6, 7, S
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',    // A, C, E
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',  // N, Q, R, W
  ];

  constructor(private mtaData: MtaData) {}

  ngOnInit() {
    this.fetchAllFeeds();
    this.refreshInterval = window.setInterval(() => this.fetchAllFeeds(), 15000);
    this.clockInterval = window.setInterval(() => this.time.set(new Date()), 1000);
  }

  ngOnDestroy() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
    }
    if (this.clockInterval) {
      clearInterval(this.clockInterval);
    }
  }

  private async fetchAllFeeds() {
    try {
      const promises = this.feedUrls.map(url => firstValueFrom(this.mtaData.getRealtimeData(url)));
      const buffers = await Promise.all(promises);

      const allUpdates: StopTimeUpdate[] = [];

      buffers.forEach((buffer, index) => {
        try {
          const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
          feed.entity.forEach((entity: transit_realtime.IFeedEntity) => {
            if (entity.tripUpdate) {
              const routeId = entity.tripUpdate.trip?.routeId;
              entity.tripUpdate.stopTimeUpdate?.forEach((update: transit_realtime.TripUpdate.IStopTimeUpdate) => {
                const arrivalTime = update.arrival?.time;
                const departureTime = update.departure?.time;
                const timesSquareStops = ['R16', '127', '725', '902'];

                if (update.stopId && timesSquareStops.some(stop => update.stopId?.startsWith(stop))) {
                  const direction = update.stopId.slice(-1) as 'N' | 'S';
                  allUpdates.push({
                    tripId: entity.tripUpdate?.trip?.tripId ?? entity.id,
                    stopId: update.stopId,
                    arrival: this.convertToNumber(arrivalTime),
                    departure: this.convertToNumber(departureTime),
                    routeId: routeId ?? undefined,
                    direction: direction,
                    destination: this.getDestination(routeId, direction)
                  });
                }
              });
            }
          });
        } catch (error) {
          console.error(`Error processing feed from ${this.feedUrls[index]}:`, error);
        }
      });

      this.arrivalTimes.update(currentArrivals => {
        // Create a map of the current arrivals for efficient lookup.
        const arrivalsMap = new Map(currentArrivals.map(a => [a.tripId, a]));

        // Update existing entries or add new ones from the latest fetch.
        for (const update of allUpdates) {
          arrivalsMap.set(update.tripId, update);
        }

        // Create a set of trip IDs from the latest fetch for efficient filtering.
        const newTripIds = new Set(allUpdates.map(a => a.tripId));

        // Filter out any old trips that are no longer in the new feed.
        const finalArrivals = Array.from(arrivalsMap.values())
          .filter(a => newTripIds.has(a.tripId));

        return finalArrivals;
      });
    } catch (error) {
      console.error('Error fetching one or more feeds:', error);
    }
  }

  private convertToNumber(value: number | Long | null | undefined): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'number') {
      return value;
    }
    return value.toNumber();
  }

  protected getMinutesUntilArrival(arrival: number): string {
    const nowInSeconds = Date.now() / 1000;
    const diffInSeconds = arrival - nowInSeconds;
    const diffInMinutes = Math.floor(diffInSeconds / 60);

    if (diffInMinutes <= 0) {
      return 'NOW';
    }

    return `${diffInMinutes} min`;
  }

  protected trackByTripId(index: number, arrival: StopTimeUpdate): string {
    return arrival.tripId;
  }

  private getDestination(routeId: string | null | undefined, direction: 'N' | 'S'): string | undefined {
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
      'A': { N: 'Inwood-207 St', S: 'Far Rockaway-Mott Av' },
      'C': { N: '168 St', S: 'Euclid Av' },
      'E': { N: 'Jamaica Center-Parsons/Archer', S: 'World Trade Center' },
      'N': { N: 'Astoria-Ditmars Blvd', S: 'Coney Island-Stillwell Av' },
      'Q': { N: '96 St', S: 'Coney Island-Stillwell Av' },
      'R': { N: 'Forest Hills-71 Av', S: 'Bay Ridge-95 St' },
      'W': { N: 'Astoria-Ditmars Blvd', S: 'Whitehall St' },
    };

    const routeDestinations = destinations[routeId as keyof typeof destinations];
    return routeDestinations ? routeDestinations[direction].toUpperCase() : undefined;
  }
}
