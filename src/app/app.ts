import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MtaData } from './mta-data';
import { transit_realtime } from 'gtfs-realtime-bindings';
import Long from 'long';

interface StopTimeUpdate {
  stopId: string;
  arrival?: number;
  departure?: number;
}

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('mta-departure-board');
  protected arrivalTimes = signal<StopTimeUpdate[]>([]);

  private readonly feedUrls = [
    '/api/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',       // 1, 2, 3, 4, 5, 6, 7, S
    '/api/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',    // A, C, E
    '/api/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',  // N, Q, R, W
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
            entity.tripUpdate.stopTimeUpdate?.forEach((update: transit_realtime.TripUpdate.IStopTimeUpdate) => {
              const arrivalTime = update.arrival?.time;
              const departureTime = update.departure?.time;

              // Times Square Stop IDs
              const timesSquareStops = ['R16', '127', '725', '902'];

              if (update.stopId && timesSquareStops.some(stop => update.stopId?.startsWith(stop))) {
                updates.push({
                  stopId: update.stopId,
                  arrival: this.convertToNumber(arrivalTime),
                  departure: this.convertToNumber(departureTime)
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
