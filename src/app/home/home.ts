import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtaColorsService } from '../mta-colors.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouteBadgeComponent, RouterModule],
  templateUrl: './home.html',
})
export class HomeComponent {
  colors = inject(MtaColorsService);
  groupedLines = this.colors.getGroupedLines();
}
