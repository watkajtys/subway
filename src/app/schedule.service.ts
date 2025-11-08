import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';

interface Schedule {
  [date: string]: 'weekday' | 'saturday' | 'sunday';
}

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly http = inject(HttpClient);

  private schedule$: Observable<Schedule> = this.http
    .get<Schedule>('/assets/schedule.json')
    .pipe(shareReplay(1));

  getServiceDay(date: Date): Observable<'weekday' | 'saturday' | 'sunday'> {
    const dateString = this.formatDate(date);
    return this.schedule$.pipe(
      map((schedule) => {
        if (schedule[dateString]) {
          return schedule[dateString];
        }

        const day = date.getDay();
        if (day >= 1 && day <= 5) {
          return 'weekday';
        } else if (day === 6) {
          return 'saturday';
        } else {
          return 'sunday';
        }
      })
    );
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }
}
