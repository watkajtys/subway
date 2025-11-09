import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MtaColorsService } from '../mta-colors.service';

@Component({
  selector: 'app-route-badge',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './route-badge.html',
  styleUrl: './route-badge.css'
})
export class RouteBadgeComponent {
  @Input({ required: true }) routeId!: string;
  @Input() size: 'small' | 'large' = 'small';
  @Input() isButton: boolean = false;

  private readonly mtaColorsSvc = inject(MtaColorsService);

  protected backgroundColor = computed(() => {
    return this.mtaColorsSvc.getColor(this.routeId);
  });

  protected textColor = computed(() => {
    return this.mtaColorsSvc.getLineTextColor(this.routeId);
  });
}
