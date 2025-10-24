import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class MtaColorsService {
  private readonly lineColors: { [key: string]: string } = {
    // IND 8th Avenue Line
    'A': '#0039A6',
    'C': '#0039A6',
    'E': '#0039A6',
    // IND 6th Avenue Line
    'B': '#FF6319',
    'D': '#FF6319',
    'F': '#FF6319',
    'M': '#FF6319',
    // IND Crosstown Line
    'G': '#6CBE45',
    // BMT Nassau Street Line
    'J': '#996633',
    'Z': '#996633',
    // BMT Canarsie Line
    'L': '#A7A9AC',
    // BMT Broadway Line
    'N': '#FCCC0A',
    'Q': '#FCCC0A',
    'R': '#FCCC0A',
    'W': '#FCCC0A',
    // IRT Broadway-7th Avenue Line
    '1': '#EE352E',
    '2': '#EE352E',
    '3': '#EE352E',
    // IRT Lexington Avenue Line
    '4': '#00933C',
    '5': '#00933C',
    '6': '#00933C',
    // IRT Flushing Line
    '7': '#B933AD',
    // Shuttles
    'S': '#808183'
  };

  getColor(line: string): string {
    return this.lineColors[line.toUpperCase()] || '#808183'; // Default to shuttle gray
  }
}
