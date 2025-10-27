import { Routes } from '@angular/router';
import { DepartureBoardComponent } from './departure-board/departure-board';
import { TrainDetailComponent } from './train-detail/train-detail';
import { StopNameService } from './stop-name.service';
import { inject } from '@angular/core';

const stopNameResolver = () => {
  return inject(StopNameService).loadStopNames();
};

export const routes: Routes = [
  {
    path: '',
    component: DepartureBoardComponent,
    resolve: { stopNames: stopNameResolver },
  },
  {
    path: 'trip/:id',
    component: TrainDetailComponent,
    resolve: { stopNames: stopNameResolver },
  },
];
