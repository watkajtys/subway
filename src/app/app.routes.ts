import { Routes } from '@angular/router';
import { DepartureBoardComponent } from './departure-board/departure-board';
import { TrainDetailComponent } from './train-detail/train-detail';
import { LineViewComponent } from './line-view/line-view';
import { StopNameService } from './stop-name.service';
import { inject } from '@angular/core';
import { TransfersService } from './transfers.service';
import { HomepageComponent } from './homepage/homepage';

const stopNameResolver = () => {
  return inject(StopNameService).loadStopNames();
};

const transfersResolver = () => {
  return inject(TransfersService).loadTransfers();
};

export const routes: Routes = [
  {
    path: '',
    component: HomepageComponent,
    resolve: { stopNames: stopNameResolver, transfers: transfersResolver },
  },
  {
    path: 'station/:id',
    component: DepartureBoardComponent,
    resolve: { stopNames: stopNameResolver, transfers: transfersResolver },
  },
  {
    path: 'trip/:id',
    component: TrainDetailComponent,
    resolve: { stopNames: stopNameResolver, transfers: transfersResolver },
  },
  {
    path: 'line/:id',
    component: LineViewComponent,
    resolve: { stopNames: stopNameResolver, transfers: transfersResolver },
  },
];
