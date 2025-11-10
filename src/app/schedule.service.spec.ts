import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { ScheduleService } from './schedule.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let httpMock: HttpTestingController;

  const mockSchedule = {
    B: [{ days: [0, 6], message: 'No weekend service' }],
    C: [{ hours: [0, 1, 2, 3, 4, 5], message: 'No late night service' }],
    Z: [{ days: [0, 6], hours: [10, 11, 12], message: 'Special weekend midday outage' }],
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        provideRouter([]),
        provideZonelessChangeDetection(),
        ScheduleService,
      ],
    });
    service = TestBed.inject(ScheduleService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should return the correct message for a weekend-only outage', (done) => {
    //
    const mockDate = new Date('2024-03-10T12:00:00');
    class FakeDate {
      constructor() {
        return mockDate;
      }
    }
    spyOn(window, 'Date').and.callFake(FakeDate as any);


    service.getServiceMessage('B').subscribe((message) => {
      expect(message).toBe('No weekend service');
      done();
    });

    const req = httpMock.expectOne('/assets/service-schedule.json');
    expect(req.request.method).toBe('GET');
    req.flush(mockSchedule);
  });

  it('should return null for a line that is in service', (done) => {
    const mockDate = new Date('2024-03-11T12:00:00');
    class FakeDate {
      constructor() {
        return mockDate;
      }
    }
    spyOn(window, 'Date').and.callFake(FakeDate as any);

    service.getServiceMessage('B').subscribe((message) => {
      expect(message).toBeNull();
      done();
    });

    const req = httpMock.expectOne('/assets/service-schedule.json');
    req.flush(mockSchedule);
  });

  it('should return the correct message for a late-night outage', (done) => {
    const mockDate = new Date('2024-03-11T02:00:00');
    class FakeDate {
      constructor() {
        return mockDate;
      }
    }
    spyOn(window, 'Date').and.callFake(FakeDate as any);

    service.getServiceMessage('C').subscribe((message) => {
      expect(message).toBe('No late night service');
      done();
    });

    const req = httpMock.expectOne('/assets/service-schedule.json');
    req.flush(mockSchedule);
  });

  it('should return the correct message for a combined day and hour outage', (done) => {
    const mockDate = new Date('2024-03-10T11:00:00');
    class FakeDate {
      constructor() {
        return mockDate;
      }
    }
    spyOn(window, 'Date').and.callFake(FakeDate as any);

    service.getServiceMessage('Z').subscribe((message) => {
      expect(message).toBe('Special weekend midday outage');
      done();
    });

    const req = httpMock.expectOne('/assets/service-schedule.json');
    req.flush(mockSchedule);
  });

  it('should return null if only the day matches but not the hour', (done) => {
    const mockDate = new Date('2024-03-10T14:00:00');
    class FakeDate {
      constructor() {
        return mockDate;
      }
    }
    spyOn(window, 'Date').and.callFake(FakeDate as any);

    service.getServiceMessage('Z').subscribe((message) => {
      expect(message).toBeNull();
      done();
    });

    const req = httpMock.expectOne('/assets/service-schedule.json');
    req.flush(mockSchedule);
  });
});
