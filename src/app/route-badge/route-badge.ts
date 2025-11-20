import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MtaColorsService } from '../mta-colors.service';

export type BadgeStatus = 'active' | 'scheduled_inactive';

@Component({
  selector: 'app-route-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './route-badge.html',
  styleUrl: './route-badge.css',
})
export class RouteBadgeComponent {
  routeId = input.required<string>();
  size = input<'small' | 'large'>('small');
  isButton = input<boolean>(false);
  status = input<BadgeStatus>('active');

  private readonly mtaColorsSvc = inject(MtaColorsService);

  protected backgroundColor = computed(() => {
    return this.mtaColorsSvc.getColor(this.routeId());
  });

  protected textColor = computed(() => {
    return this.mtaColorsSvc.getLineTextColor(this.routeId());
  });
}
