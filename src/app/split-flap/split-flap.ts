import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Flap {
  currentLetter: string;
  nextLetter: string;
  isFlipping: boolean;
}

@Component({
  selector: 'app-split-flap',
  templateUrl: './split-flap.html',
  styleUrls: ['./split-flap.css'],
  imports: [CommonModule],
  standalone: true,
})
export class SplitFlapComponent implements OnChanges {
  @Input() letters: string[] | null = [];
  flaps: Flap[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['letters'] && changes['letters'].currentValue) {
      const newLetters = changes['letters'].currentValue as string[];

      if (this.flaps.length === 0) {
        this.flaps = newLetters.map(letter => ({
          currentLetter: letter,
          nextLetter: letter,
          isFlipping: false,
        }));
        return;
      }

      newLetters.forEach((newLetter, i) => {
        if (this.flaps[i].currentLetter !== newLetter) {
          this.flaps[i].nextLetter = newLetter;
          this.flaps[i].isFlipping = true;
          setTimeout(() => {
            this.flaps[i].currentLetter = newLetter;
            this.flaps[i].isFlipping = false;
          }, 500);
        }
      });
    }
  }
}
