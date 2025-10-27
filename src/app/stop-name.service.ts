import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class StopNameService {
  private http: HttpClient = inject(HttpClient);
  private stopNames: Map<string, string> = new Map();
  private loaded = false;

  public loadStopNames(): Observable<void> {
    if (this.loaded) {
      return of(undefined);
    }
    return this.http.get('assets/stops.txt', { responseType: 'text' }).pipe(
      map((data) => {
        const lines = data.split('\n');
        lines.forEach((line) => {
          const parts = line.split(',');
          if (parts.length >= 3) {
            this.stopNames.set(parts[0], this.formatStopName(parts[2]));
          }
        });
        this.loaded = true;
      }),
      catchError((error) => {
        console.error('Error loading stop names:', error);
        return of(undefined);
      })
    );
  }

  public getStopName(stopId: string): string | undefined {
    // Parent station IDs are the first 3 characters of the stop ID
    const parentStationId = stopId.substring(0, 3);
    return this.stopNames.get(parentStationId);
  }

  private formatStopName(name: string): string {
    return name
      .toLowerCase()
      .split(' ')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
