import { Component, OnInit, OnDestroy, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MtaData } from './mta-data';
import { transit_realtime } from 'gtfs-realtime-bindings';
import Long from 'long';
import { RouteBadgeComponent } from './route-badge/route-badge';

interface StopTimeUpdate {
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
    this.refreshInterval = window.setInterval(() => this.fetchAllFeeds(), 30000);
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

  private fetchAllFeeds() {
    this.arrivalTimes.set([]); // Clear old arrivals before fetching new ones
    this.feedUrls.forEach(url => this.fetchData(url));
  }

  private fetchData(url: string) {
    this.mtaData.getRealtimeData(url).subscribe(buffer => {
      try {
        const feed = transit_realtime.FeedMessage.decode(new Uint8Array(buffer));
        const updates: StopTimeUpdate[] = [];
        feed.entity.forEach((entity: transit_realtime.IFeedEntity) => {
          if (entity.tripUpdate) {
            const routeId = entity.tripUpdate.trip.routeId;
            entity.tripUpdate.stopTimeUpdate?.forEach((update: transit_realtime.TripUpdate.IStopTimeUpdate) => {
              const arrivalTime = update.arrival?.time;
              const departureTime = update.departure?.time;

              // Times Square Stop IDs
              const timesSquareStops = ['R16', '127', '725', '902'];

              if (update.stopId && timesSquareStops.some(stop => update.stopId?.startsWith(stop))) {
                const direction = update.stopId.slice(-1) as 'N' | 'S';
                updates.push({
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

        this.arrivalTimes.update(current => [...current, ...updates]);
      } catch (error) {
        console.error(`Error processing feed from ${url}:`, error);
      }
    });
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
    return routeDestinations ? routeDestinations[direction] : undefined;
  }
}
