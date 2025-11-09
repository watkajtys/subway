import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MtaColorsService } from '../mta-colors.service';
import { RouteBadgeComponent } from '../route-badge/route-badge';
import { RouterModule } from '@angular/router';
import { StationSearch } from '../station-search/station-search';
import { HeaderComponent } from '../header/header';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouteBadgeComponent,
    RouterModule,
    StationSearch,
    HeaderComponent,
  ],
  templateUrl: './home.html',
  styleUrls: ['./home.css'],
})
export class HomeComponent {
  protected mtaColorsService = inject(MtaColorsService);
  protected groupedLines = this.mtaColorsService.getGroupedLines();
}
