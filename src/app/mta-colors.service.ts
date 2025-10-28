import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MtaColorsService {
  private readonly lineColors: { [key: string]: string } = {
    // IND 8th Avenue Line
    'A': '#0062CF',
    'C': '#0062CF',
    'E': '#0062CF',
    // IND 6th Avenue Line
    'B': '#EB6800',
    'D': '#EB6800',
    'F': '#EB6800',
    'M': '#EB6800',
    // IND Crosstown Line
    'G': '#799534',
    // BMT Nassau Street Line
    'J': '#8E5C33',
    'Z': '#8E5C33',
    // BMT Canarsie Line
    'L': '#7C858C',
    // BMT Broadway Line
    'N': '#F6BC26',
    'Q': '#F6BC26',
    'R': '#F6BC26',
    'W': '#F6BC26',
    // IRT Broadway-7th Avenue Line
    '1': '#D82233',
    '2': '#D82233',
    '3': '#D82233',
    // IRT Lexington Avenue Line
    '4': '#009952',
    '5': '#009952',
    '6': '#009952',
    // IRT Flushing Line
    '7': '#9A38A1',
    // Shuttles
    'S': '#7C858C',
    // Staten Island Railway
    'SIR': '#08179C',
    // Second Avenue Subway
    'T': '#008EB7'
  };

  getColor(line: string): string {
    return this.lineColors[line.toUpperCase()] || '#7C858C'; // Default to gray
  }
}
