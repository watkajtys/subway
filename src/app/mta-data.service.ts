import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { transit_realtime } from 'gtfs-realtime-bindings';
import Long from 'long';
import { ArrivalTime, StateService } from './state.service';

@Injectable({
  providedIn: 'root',
})
export class MtaDataService {
  private readonly feedUrls = [
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs', // 1, 2, 3, 4, 5, 6, 7, S
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace', // A, C, E
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw', // N, Q, R, W
  ];

  constructor(private http: HttpClient) {}

  public fetchAllFeeds(): Observable<ArrivalTime[]> {
    const requests = this.feedUrls.map((url) =>
      this.http.get(url, { responseType: 'arraybuffer' }).pipe(
        catchError((error) => {
          console.error(`Error fetching feed from ${url}:`, error);
          return of(new ArrayBuffer(0)); // Return an empty buffer on error
        })
      )
    );

    return forkJoin(requests).pipe(
      map((buffers) => {
        const allUpdates: ArrivalTime[] = [];
        buffers.forEach((buffer, index) => {
          if (buffer.byteLength === 0) return;

          try {
            const feed = transit_realtime.FeedMessage.decode(
              new Uint8Array(buffer)
            );
            feed.entity.forEach((entity: transit_realtime.IFeedEntity) => {
              if (entity.tripUpdate) {
                const routeId = entity.tripUpdate.trip?.routeId;
                entity.tripUpdate.stopTimeUpdate?.forEach(
                  (update: transit_realtime.TripUpdate.IStopTimeUpdate) => {
                    const arrivalTime = this.convertToNumber(
                      update.arrival?.time
                    );
                    const timesSquareStops = ['R16', '127', '725', '902'];

                    if (
                      update.stopId &&
                      timesSquareStops.some((stop) =>
                        update.stopId?.startsWith(stop)
                      ) &&
                      arrivalTime
                    ) {
                      const direction = update.stopId.slice(-1) as 'N' | 'S';
                      allUpdates.push({
                        tripId: entity.tripUpdate?.trip?.tripId ?? entity.id,
                        stopId: update.stopId,
                        arrivalTime: arrivalTime,
                        routeId: routeId ?? '',
                        direction: direction,
                      });
                    }
                  }
                );
              }
            });
          } catch (error) {
            console.error(
              `Error processing feed from ${this.feedUrls[index]}:`,
              error
            );
          }
        });
        return allUpdates;
      })
    );
  }

  private convertToNumber(
    value: number | Long | null | undefined
  ): number | undefined {
    if (value === null || value === undefined) {
      return undefined;
    }
    if (typeof value === 'number') {
      return value;
    }
    return value.toNumber();
  }
}
