import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideZonelessChangeDetection } from '@angular/core';
import { routes } from '../app.routes';
import { StopNameService } from '../stop-name.service';
import { TransfersService } from '../transfers.service';
import { AccessibilityService } from '../accessibility.service';
import { MtaColorsService } from '../mta-colors.service';
import { DestinationPipe } from '../destination.pipe';
import { MtaDataService } from '../mta-data.service';
import { RealtimeService } from '../realtime.service';
import { StateService } from '../state.service';

import { LineViewComponent } from './line-view';

describe('LineViewComponent', () => {
  let component: LineViewComponent;
  let fixture: ComponentFixture<LineViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LineViewComponent, HttpClientTestingModule],
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

    fixture = TestBed.createComponent(LineViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
