import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, shareReplay } from 'rxjs/operators';

interface ScheduleRule {
  days?: number[];
  hours?: number[];
  message: string;
}

interface ServiceSchedule {
  [line: string]: ScheduleRule[];
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private http = inject(HttpClient);
  private scheduleData$: Observable<ServiceSchedule | null> = this.http
    .get<ServiceSchedule>('/assets/service-schedule.json')
    .pipe(
      catchError((error) => {
        console.error('Error loading service schedule:', error);
        return of(null);
      }),
      shareReplay(1)
    );

  getServiceMessage(lineId: string): Observable<string | null> {
    return this.scheduleData$.pipe(
      map((schedule) => {
        if (!schedule || !schedule[lineId]) {
          return null;
        }

        const rules = schedule[lineId];
        const now = new Date();
        const currentDay = now.getDay();
        const currentHour = now.getHours();

        for (const rule of rules) {
          const dayMatch = !rule.days || rule.days.includes(currentDay);
          const hourMatch = !rule.hours || rule.hours.includes(currentHour);

          if (dayMatch && hourMatch) {
            return rule.message;
          }
        }

        return null;
      })
    );
  }
}
