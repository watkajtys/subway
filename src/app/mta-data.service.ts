import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { FeedMessage, TripUpdate } from './generated/gtfs-realtime';

@Injectable({
  providedIn: 'root',
})
export class MtaDataService {
  private readonly feedMap: { [key: string]: string } = {
    '123456S':
      'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs',
    ACE: 'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-ace',
    NQRW: 'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-nqrw',
    BDFM: 'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-bdfm',
    JZ: 'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-jz',
    G: 'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-g',
    L: 'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-l',
    SI: 'https://mta-proxy-worker.matty-f7e.workers.dev?url=https://api-endpoint.mta.info/Dataservice/mtagtfsfeeds/nyct%2Fgtfs-si',
  };

  private readonly routeToFeedMap: { [key: string]: string } = {
    '1': '123456S', '2': '123456S', '3': '123456S', '4': '123456S', '5': '123456S', '6': '123456S', 'S': '123456S',
    'A': 'ACE', 'C': 'ACE', 'E': 'ACE',
    'N': 'NQRW', 'Q': 'NQRW', 'R': 'NQRW', 'W': 'NQRW',
    'B': 'BDFM', 'D': 'BDFM', 'F': 'BDFM', 'M': 'BDFM',
    'J': 'JZ', 'Z': 'JZ',
    'G': 'G',
    'L': 'L',
    'SI': 'SI',
  };

  constructor(private http: HttpClient) {}

  public fetchAllFeeds(): Observable<[TripUpdate[], Map<string, Set<string>>]> {
    const requests = Object.values(this.feedMap).map((url) =>
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
        const stopToRoutesMap = new Map<string, Set<string>>();
        buffers.forEach((buffer, index) => {
          if (buffer.byteLength === 0) return;

          try {
            const feed = FeedMessage.decode(new Uint8Array(buffer));
            feed.entity.forEach((entity) => {
              if (entity.tripUpdate) {
                allUpdates.push(entity.tripUpdate);
                const routeId = entity.tripUpdate.trip?.routeId;
                if (routeId && entity.tripUpdate.stopTimeUpdate) {
                  entity.tripUpdate.stopTimeUpdate.forEach((stopTimeUpdate) => {
                    const stopId = stopTimeUpdate.stopId;
                    if (stopId) {
                      if (!stopToRoutesMap.has(stopId)) {
                        stopToRoutesMap.set(stopId, new Set());
                      }
                      stopToRoutesMap.get(stopId)!.add(routeId);
                    }
                  });
                }
              }
            });
          } catch (error) {
            console.error(
              `Error processing feed from ${Object.values(this.feedMap)[index]}:`,
              error
            );
          }
        });
        return [allUpdates, stopToRoutesMap];
      })
    );
  }

  public fetchFeedsForRoutes(
    routeIds: string[]
  ): Observable<[TripUpdate[], Map<string, Set<string>>]> {
    const feedKeys = new Set(
      routeIds.map((routeId) => this.routeToFeedMap[routeId]).filter(Boolean)
    );
    const feedUrls = Array.from(feedKeys).map((key) => this.feedMap[key]);

    if (feedUrls.length === 0) {
      return of([[], new Map()]);
    }

    const requests = feedUrls.map((url) =>
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
        const stopToRoutesMap = new Map<string, Set<string>>();
        buffers.forEach((buffer, index) => {
          if (buffer.byteLength === 0) return;

          try {
            const feed = FeedMessage.decode(new Uint8Array(buffer));
            feed.entity.forEach((entity) => {
              if (entity.tripUpdate) {
                allUpdates.push(entity.tripUpdate);
                const routeId = entity.tripUpdate.trip?.routeId;
                if (routeId && entity.tripUpdate.stopTimeUpdate) {
                  entity.tripUpdate.stopTimeUpdate.forEach((stopTimeUpdate) => {
                    const stopId = stopTimeUpdate.stopId;
                    if (stopId) {
                      if (!stopToRoutesMap.has(stopId)) {
                        stopToRoutesMap.set(stopId, new Set());
                      }
                      stopToRoutesMap.get(stopId)!.add(routeId);
                    }
                  });
                }
              }
            });
          } catch (error) {
            console.error(
              `Error processing feed from ${feedUrls[index]}:`,
              error
            );
          }
        });
        return [allUpdates, stopToRoutesMap];
      })
    );
  }
}
