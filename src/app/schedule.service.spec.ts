import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ScheduleService, provideZonelessChangeDetection()],
    });
    service = TestBed.inject(ScheduleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return "weekday" for a regular weekday', (done) => {
    const testDate = new Date('2025-11-05T12:00:00Z'); // A Wednesday
    service.getServiceDay(testDate).subscribe((serviceDay) => {
      expect(serviceDay).toBe('weekday');
      done();
    });

    const req = httpMock.expectOne('/assets/schedule.json');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should return "saturday" for a Saturday', (done) => {
    const testDate = new Date('2025-11-08T12:00:00Z'); // A Saturday
    service.getServiceDay(testDate).subscribe((serviceDay) => {
      expect(serviceDay).toBe('saturday');
      done();
    });

    const req = httpMock.expectOne('/assets/schedule.json');
    expect(req.request.method).toBe('GET');
    req.flush({});
  });

  it('should return "sunday" for a Sunday', (done) => {
    const testDate = new Date('2025-11-09T12:00:00Z'); // A Sunday
    service.getServiceDay(testDate).subscribe((serviceDay) => {
      expect(serviceDay).toBe('sunday');
      done();
    });

    const req = httpMock.expectOne('/assets/schedule.json');
    expect(req.request.method).toBe('GET');
    req.flush({});
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

    const req = httpMock.expectOne('/assets/schedule.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSchedule);
  });
});
