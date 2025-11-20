import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ScheduleService } from './schedule.service';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { StopNameService } from './stop-name.service';
import { TransfersService } from './transfers.service';
import { AccessibilityService } from './accessibility.service';
import { MtaColorsService } from './mta-colors.service';
import { DestinationPipe } from './destination.pipe';
import { MtaDataService } from './mta-data.service';
import { RealtimeService } from './realtime.service';
import { StateService } from './state.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        ScheduleService,
        provideRouter(routes),
        provideZonelessChangeDetection(),
        MtaDataService,
        StateService,
        StopNameService,
        TransfersService,
        RealtimeService,
        AccessibilityService,
        MtaColorsService,
        DestinationPipe,
      ],
    });
    service = TestBed.inject(ScheduleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  const flushRequests = (scheduleData = {}, lineScheduleData = {}) => {
    const req1 = httpMock.expectOne('/assets/schedule.json');
    req1.flush(scheduleData);

    const req2 = httpMock.expectOne('/assets/line-schedules.json');
    req2.flush(lineScheduleData);
  };

  it('should be created', () => {
    expect(service).toBeTruthy();
    flushRequests();
  });

  it('should return "weekday" for a regular weekday', (done) => {
    const testDate = new Date('2025-11-05T12:00:00Z'); // A Wednesday
    service.getServiceDay(testDate).subscribe((serviceDay) => {
      expect(serviceDay).toBe('weekday');
      done();
    });
    flushRequests();
  });

  it('should return "saturday" for a Saturday', (done) => {
    const testDate = new Date('2025-11-08T12:00:00Z'); // A Saturday
    service.getServiceDay(testDate).subscribe((serviceDay) => {
      expect(serviceDay).toBe('saturday');
      done();
    });
    flushRequests();
  });

  it('should return "sunday" for a Sunday', (done) => {
    const testDate = new Date('2025-11-09T12:00:00Z'); // A Sunday
    service.getServiceDay(testDate).subscribe((serviceDay) => {
      expect(serviceDay).toBe('sunday');
      done();
    });
    flushRequests();
  });

  it('should return "sunday" for Thanksgiving holiday', (done) => {
    const testDate = new Date('2025-11-27T12:00:00Z'); // Thanksgiving
    const mockSchedule = {
      '20251127': 'sunday',
    };

    service.getServiceDay(testDate).subscribe((serviceDay) => {
      expect(serviceDay).toBe('sunday');
      done();
    });
    flushRequests(mockSchedule);
  });
});
