import { TestBed } from '@angular/core/testing';
import { App } from './app';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { routes } from './app.routes';
import { StopNameService } from './stop-name.service';
import { TransfersService } from './transfers.service';
import { AccessibilityService } from './accessibility.service';
import { MtaColorsService } from './mta-colors.service';
import { DestinationPipe } from './destination.pipe';
import { MtaDataService } from './mta-data.service';
import { RealtimeService } from './realtime.service';
import { StateService } from './state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App, HttpClientTestingModule],
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
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });
});
