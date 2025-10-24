import { Component, Input, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtaColorsService } from '../mta-colors.service';

@Component({
  selector: 'app-route-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './route-badge.html',
  styleUrl: './route-badge.css'
})
export class RouteBadgeComponent {
  @Input({ required: true }) routeId!: string;

  private readonly mtaColorsSvc = inject(MtaColorsService);

  protected backgroundColor = computed(() => {
    return this.mtaColorsSvc.getColor(this.routeId);
  });
}
