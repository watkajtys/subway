import { Injectable, inject } from '@angular/core';
import { StateService } from './state.service';
import { HttpClient } from '@angular/common/http';
import { map, catchError } from 'rxjs/operators';
import { Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransfersService {
  private state: StateService = inject(StateService);
  private http: HttpClient = inject(HttpClient);
  private transfersMap: Map<string, string[]> = new Map();
  private loaded = false;

  public loadTransfers(): Observable<void> {
    if (this.loaded) {
      return of(undefined);
    }
    return this.http.get('assets/transfers.txt', { responseType: 'text' }).pipe(
      map((data) => {
        const lines = data.split('\n');
        // Skip header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i];
          const parts = line.split(',');
          // from_stop_id,to_stop_id,transfer_type,min_transfer_time
          if (parts.length >= 2) {
            const fromStopId = parts[0];
            const toStopId = parts[1];

            if (fromStopId !== toStopId) {
              if (!this.transfersMap.has(fromStopId)) {
                this.transfersMap.set(fromStopId, []);
              }
              this.transfersMap.get(fromStopId)!.push(toStopId);
            }
          }
        }
        this.loaded = true;
      }),
      catchError((error) => {
        console.error('Error loading transfers:', error);
        return of(undefined);
      })
    );
  }

  public getTransfers(fromStopId: string): string[] {
    const stopToRoutesMap = this.state.stopToRoutesMap();
    const toStopIds = this.transfersMap.get(fromStopId) ?? [];

    const transferRoutes = new Set<string>();

    toStopIds.forEach(toStopId => {
      const routes = stopToRoutesMap.get(toStopId);
      if (routes) {
        routes.forEach(route => transferRoutes.add(route));
      }
    });

    return Array.from(transferRoutes);
  }
}
