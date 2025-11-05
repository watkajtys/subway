import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { Station, StationService } from '../station.service';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, startWith } from 'rxjs/operators';
import { combineLatest, map, Observable } from 'rxjs';

@Component({
  selector: 'app-station-search',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './station-search.html',
  styleUrls: ['./station-search.css'],
})
export class StationSearch {
  private stationService = inject(StationService);
  private router = inject(Router);

  stations$: Observable<Station[]> = this.stationService.getStations();
  searchControl = new FormControl('');
  filteredStations$: Observable<Station[]>;

  constructor() {
    const search$: Observable<string> = this.searchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      map((value) => (value || '').toLowerCase())
    );

    this.filteredStations$ = combineLatest([this.stations$, search$]).pipe(
      map(([stations, filter]) => {
        if (!filter) {
          return [];
        }
        return stations
          .filter((station) => station.name.toLowerCase().includes(filter))
          .slice(0, 5);
      })
    );
  }

  selectStation(station: Station) {
    this.router.navigate(['/station', station.ids.join(',')]);
    this.searchControl.setValue('');
  }
}
