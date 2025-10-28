import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

export interface Station {
  name: string;
  ids: string[];
}

@Injectable({
  providedIn: 'root',
})
export class StopNameService {
  private http: HttpClient = inject(HttpClient);
  private stopIdToName: Map<string, string> = new Map();
  private stationToStopIds: Map<string, string[]> = new Map();
  private loaded = false;

  public loadStopNames(): Observable<void> {
    if (this.loaded) {
      return of(undefined);
    }
    return this.http.get<Station[]>('assets/stations.json').pipe(
      map((stations) => {
        this.stationToStopIds.clear();
        this.stopIdToName.clear();

        stations.forEach((station) => {
          this.stationToStopIds.set(station.name, station.ids);
          station.ids.forEach((stopId) => {
            this.stopIdToName.set(stopId, station.name);
          });
        });
        this.loaded = true;
      }),
      catchError((error) => {
        console.error('Error loading stations.json:', error);
        return of(undefined);
      })
    );
  }

  public getStopName(stopId: string): string | undefined {
    const parentStationId = stopId.slice(0, -1);
    return this.stopIdToName.get(parentStationId);
  }

  public getStations(): Station[] {
    return Array.from(this.stationToStopIds.entries())
      .map(([name, ids]) => ({ name, ids }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  public getStopIdsForStation(stationName: string): string[] | undefined {
    return this.stationToStopIds.get(stationName);
  }
}
