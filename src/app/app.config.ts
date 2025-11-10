import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { StopNameService } from './stop-name.service';
import { TransfersService } from './transfers.service';
import { AccessibilityService } from './accessibility.service';
import { MtaColorsService } from './mta-colors.service';
import { DestinationPipe } from './destination.pipe';
import { MtaDataService } from './mta-data.service';
import { RealtimeService } from './realtime.service';
import { StateService } from './state.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes, withComponentInputBinding()),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
    MtaDataService,
    StateService,
    StopNameService,
    TransfersService,
    RealtimeService,
    AccessibilityService,
    MtaColorsService,
    DestinationPipe,
  ],
};
