import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Station {
  name: string;
  ids: string[];
}

@Injectable({
  providedIn: 'root',
})
export class StationService {
  private http = inject(HttpClient);

  getStations(): Observable<Station[]> {
    return this.http.get<Station[]>('/assets/stations.json');
  }
}
