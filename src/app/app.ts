import { Component, OnInit, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MtaData } from './mta-data';
import { transit_realtime } from 'gtfs-realtime-bindings';
import Long from 'long';
import { SplitFlapComponent } from './split-flap/split-flap';
import { SplitFlapService } from './split-flap/split-flap.service';

interface StopTimeUpdate {
  stopId: string;
  arrival?: number;
  departure?: number;
  routeId?: string;
}

@Component({
  selector: 'app-root',
  imports: [CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('mta-departure-board');
  protected arrivalTimes = signal<StopTimeUpdate[]>([]);
  public splitFlapInstance = inject(SplitFlapService).getSplitFlapInstance();

  protected upcomingArrivals = computed(() => {
    const nowInSeconds = Date.now() / 1000;
    const upcoming = this.arrivalTimes()
      .filter(a => a.arrival && a.arrival > nowInSeconds)
      .sort((a, b) => a.arrival! - b.arrival!)
      .slice(0, 10);
    return upcoming;
  });

  private readonly feedUrls = [
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',       // 1, 2, 3, 4, 5, 6, 7, S
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',    // A, C, E
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',  // N, Q, R, W
  ];

  constructor(private mtaData: MtaData) {}

  ngOnInit() {
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
                updates.push({
                  stopId: update.stopId,
                  arrival: this.convertToNumber(arrivalTime),
                  departure: this.convertToNumber(departureTime),
                  routeId: routeId
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
}
