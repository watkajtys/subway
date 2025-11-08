import { Injectable, inject } from '@angular/core';
import { RealtimeService } from './realtime.service';

@Injectable({
  providedIn: 'root',
})
export class TransfersService {
  private realtimeSvc: RealtimeService = inject(RealtimeService);

  public getTransfers(fromStopId: string): string[] {
    return this.realtimeSvc.getActiveTransfers(fromStopId);
  }
}
