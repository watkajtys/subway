import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FeedMessage, TripUpdate } from './generated/gtfs-realtime';

@Injectable({
  providedIn: 'root',
})
export class MtaDataService {
  private readonly feedUrls = [
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
    'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si',
  ];

  constructor(private http: HttpClient) {}

  public fetchAllFeeds(): Observable<TripUpdate[]> {
    const requests = this.feedUrls.map((url) =>
      this.http.get(url, { responseType: 'arraybuffer' }).pipe(
        catchError((error) => {
          console.error(`Error fetching feed from ${url}:`, error);
          return of(new ArrayBuffer(0));
        })
      )
    );

    return forkJoin(requests).pipe(
      map((buffers) => {
        const allUpdates: TripUpdate[] = [];
        buffers.forEach((buffer, index) => {
          if (buffer.byteLength === 0) return;

          try {
            const feed = FeedMessage.decode(new Uint8Array(buffer));
            feed.entity.forEach((entity) => {
              if (entity.tripUpdate) {
                allUpdates.push(entity.tripUpdate);
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
}
