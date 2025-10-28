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
    return this.http.get('assets/stops.txt', { responseType: 'text' }).pipe(
      map((data) => {
        const lines = data.split('\n');
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const parts = line.split(',');
          // stop_id,stop_name,stop_lat,stop_lon
          if (parts.length >= 2) {
            const stopId = parts[0];
            const stopName = this.formatStopName(parts[1]);

            this.stopIdToName.set(stopId, stopName);

            if (!this.stationToStopIds.has(stopName)) {
              this.stationToStopIds.set(stopName, []);
            }
            this.stationToStopIds.get(stopName)!.push(stopId);
          }
        }
        this.loaded = true;
      }),
      catchError((error) => {
        console.error('Error loading stop names:', error);
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

  private formatStopName(name: string): string {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
