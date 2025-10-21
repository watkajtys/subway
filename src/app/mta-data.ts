import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MtaData {

  private readonly MTA_API_URL = environment.mtaApiUrl;

  constructor(private http: HttpClient) { }

  getRealtimeData(): Observable<ArrayBuffer> {
    return this.http.get(this.MTA_API_URL, { responseType: 'arraybuffer' });
  }
}
