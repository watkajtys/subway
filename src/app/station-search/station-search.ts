import { Component, EventEmitter, inject, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';

export interface Station {
  name: string;
  ids: string[];
}

@Component({
  selector: 'app-station-search',
  standalone: true,
  imports: [CommonModule, RouterModule, HttpClientModule],
  templateUrl: './station-search.html',
  styleUrls: ['./station-search.css'],
})
export class StationSearch {
  @Output() stationSelected = new EventEmitter<string>();

  private http = inject(HttpClient);
  private router = inject(Router);

  stations: Station[] = [];
  filteredStations: Station[] = [];
  searchTerm = '';

  constructor() {
    this.http.get<Station[]>('assets/stations.json').subscribe({
      next: (data) => {
        this.stations = data;
      },
      error: (err) => {
        console.error('Error fetching stations:', err);
      },
    });
  }

  filterStations(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm = input.value;
    if (this.searchTerm.length > 1) {
      this.filteredStations = this.stations.filter((station) =>
        station.name.toLowerCase().includes(this.searchTerm.toLowerCase())
      );
    } else {
      this.filteredStations = [];
    }
  }

  selectStation(station: Station) {
    this.searchTerm = station.name;
    this.filteredStations = [];
    this.stationSelected.emit(station.name);
  }
}
