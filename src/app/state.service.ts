import { Injectable, signal } from '@angular/core';

export interface ArrivalTime {
  routeId: string;
  tripId: string;
  stopId: string;
  arrivalTime: number;
  direction: 'N' | 'S';
}

@Injectable({
  providedIn: 'root',
})
export class StateService {
  public arrivalTimes = signal<ArrivalTime[]>([]);
  public time = signal(new Date());
  public blinker = signal(false);

  constructor() { }
}
