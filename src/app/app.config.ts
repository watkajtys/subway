import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { routes } from './app.routes';
import { StopNamePipe } from './stop-name.pipe';
import { StopNameService } from './stop-name.service';
import { TransfersService } from './transfers.service';
import { AccessibilityService } from './accessibility.service';
import { MtaColorsService } from './mta-colors.service';
import { DestinationPipe } from './destination.pipe';
import { MtaDataService } from './mta-data.service';
import { StateService } from './state.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideHttpClient(withInterceptorsFromDi()),
    MtaDataService,
    StateService,
    StopNameService,
    TransfersService,
    StopNamePipe,
    AccessibilityService,
    MtaColorsService,
    DestinationPipe,
  ],
};
