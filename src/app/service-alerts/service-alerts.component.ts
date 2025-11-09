import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StateService } from '../state.service';
import { TitleService } from '../title.service';

@Component({
  selector: 'app-service-alerts',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-alerts.html',
  styleUrl: './service-alerts.css',
})
export class ServiceAlerts {
  private stateService = inject(StateService);
  protected alerts = this.stateService.alerts;

  constructor() {
    inject(TitleService).title.set('Service Alerts');
  }
}
