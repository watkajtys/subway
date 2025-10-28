import { Injectable, signal } from '@angular/core';
import { TripUpdate } from './generated/gtfs-realtime';

export interface ArrivalTime {
  routeId: string;
  tripId: string;
  stopId: string;
  arrivalTime: number;
  direction: 'N' | 'S';
  track?: string;
}

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public arrivalTimes = signal<ArrivalTime[]>([]);
  public tripUpdatesMap = signal<Map<string, TripUpdate>>(new Map());
  public time = signal(new Date());
  public blinker = signal(false);
  public selectedStation = signal<string>('Times Sq - 42 St');

  constructor() {}
}
