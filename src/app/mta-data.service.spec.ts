import { TestBed } from '@angular/core/testing';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MtaDataService } from './mta-data.service';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { StopNameService } from './stop-name.service';
import { TransfersService } from './transfers.service';
import { AccessibilityService } from './accessibility.service';
import { MtaColorsService } from './mta-colors.service';
import { DestinationPipe } from './destination.pipe';
import { RealtimeService } from './realtime.service';
import { StateService } from './state.service';

describe('MtaDataService', () => {
  let service: MtaDataService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
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
    service = TestBed.inject(MtaDataService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
