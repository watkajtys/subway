import { Component, inject } from '@angular/core';
import { LineGroup, MtaColorsService } from '../mta-colors.service';
import { CommonModule } from '@angular/common';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { RouterModule } from '@angular/router';
import { StationSearch } from '../station-search/station-search';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, RouteBadgeComponent, RouterModule, StationSearch],
  templateUrl: './homepage.html',
  styleUrl: './homepage.css',
})
export class HomepageComponent {
  private colorsService = inject(MtaColorsService);
  lineGroups: LineGroup[] = this.colorsService.getGroupedLines();
}
