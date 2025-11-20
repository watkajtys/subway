import { inject, Injectable, Signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, shareReplay } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface Schedule {
  [date: string]: 'weekday' | 'saturday' | 'sunday';
}

export interface TimeRange {
  start: string; // "HH:mm"
  end: string;   // "HH:mm"
}

export interface DaySchedule {
  weekday: TimeRange[];
  saturday: TimeRange[];
  sunday: TimeRange[];
}

export interface LineSchedules {
  [lineId: string]: DaySchedule;
}

export type LineStatus = 'active' | 'scheduled_inactive';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  private readonly http = inject(HttpClient);

  private schedule$: Observable<Schedule> = this.http
    .get<Schedule>('/assets/schedule.json')
    .pipe(shareReplay(1));

  private lineSchedules$: Observable<LineSchedules> = this.http
    .get<LineSchedules>('/assets/line-schedules.json')
    .pipe(shareReplay(1));

  // Signals for synchronous access
  public scheduleMap = toSignal(this.schedule$, { initialValue: {} as Schedule });
  public lineSchedules = toSignal(this.lineSchedules$, { initialValue: {} as LineSchedules });

  getServiceDay(date: Date): Observable<'weekday' | 'saturday' | 'sunday'> {
    const dateString = this.formatDate(date);
    return this.schedule$.pipe(
      map((schedule) => {
        return this.calculateServiceDay(date, schedule);
      })
    );
  }

  private calculateServiceDay(date: Date, schedule: Schedule): 'weekday' | 'saturday' | 'sunday' {
    const dateString = this.formatDate(date);
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
  }

  getLineStatus(lineId: string, date: Date): LineStatus {
    const schedules = this.lineSchedules();
    if (!schedules || !schedules[lineId]) {
      return 'active'; // Default to active if no schedule defined
    }

    const serviceDay = this.calculateServiceDay(date, this.scheduleMap());
    const ranges = schedules[lineId][serviceDay];

    if (!ranges || ranges.length === 0) {
      return 'scheduled_inactive';
    }

    const currentHm = this.formatTime(date);
    const isActive = ranges.some(range => currentHm >= range.start && currentHm <= range.end);

    return isActive ? 'active' : 'scheduled_inactive';
  }

  getScheduleDescription(lineId: string): string {
    const schedules = this.lineSchedules();
    if (!schedules || !schedules[lineId]) {
      return '';
    }

    // Construct a simple description.
    // This is a heuristic: assume B/W/Z style schedules.
    // "Weekdays 06:00 - 23:00"
    const schedule = schedules[lineId];
    const parts = [];

    if (schedule.weekday.length > 0) {
      const timeStr = schedule.weekday.map(r => `${this.formatTimeFriendly(r.start)} - ${this.formatTimeFriendly(r.end)}`).join(', ');
      parts.push(`Weekdays ${timeStr}`);
    }
    if (schedule.saturday.length > 0) {
       const timeStr = schedule.saturday.map(r => `${this.formatTimeFriendly(r.start)} - ${this.formatTimeFriendly(r.end)}`).join(', ');
       parts.push(`Sat ${timeStr}`);
    }
    if (schedule.sunday.length > 0) {
       const timeStr = schedule.sunday.map(r => `${this.formatTimeFriendly(r.start)} - ${this.formatTimeFriendly(r.end)}`).join(', ');
       parts.push(`Sun ${timeStr}`);
    }

    return parts.join('; ');
  }

  private formatDate(date: Date): string {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}${month}${day}`;
  }

  private formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }

  private formatTimeFriendly(hm: string): string {
    // "13:00" -> "1:00 PM"
    const [h, m] = hm.split(':').map(Number);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
  }
}
