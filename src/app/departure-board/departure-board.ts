import { Component, OnInit } from '@angular/core';
import { MtaData } from '../mta-data';
import * as GtfsRealtimeBindings from 'gtfs-realtime-bindings';

@Component({
  selector: 'app-departure-board',
  standalone: true,
  imports: [],
  templateUrl: './departure-board.html',
  styleUrl: './departure-board.css'
})
export class DepartureBoard implements OnInit {

  constructor(private mtaDataService: MtaData) { }

  ngOnInit(): void {
    this.mtaDataService.getRealtimeData().subscribe(data => {
      try {
        const feed = GtfsRealtimeBindings.transit_realtime.FeedMessage.decode(new Uint8Array(data));
        console.log(feed);
      } catch (error) {
        console.error('Error decoding GTFS data:', error);
      }
    });
  }
}
