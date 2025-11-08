import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideZonelessChangeDetection } from '@angular/core';

import { StationSearch } from './station-search';
import { routes } from '../app.routes';
import { StopNameService } from '../stop-name.service';
import { TransfersService } from '../transfers.service';
import { AccessibilityService } from '../accessibility.service';
import { MtaColorsService } from '../mta-colors.service';
import { DestinationPipe } from '../destination.pipe';
import { MtaDataService } from '../mta-data.service';
import { RealtimeService } from '../realtime.service';
import { StateService } from '../state.service';
import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('StationSearch', () => {
  let component: StationSearch;
  let fixture: ComponentFixture<StationSearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StationSearch, HttpClientTestingModule],
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

    fixture = TestBed.createComponent(StationSearch);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
