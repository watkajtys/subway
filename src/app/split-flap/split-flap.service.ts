import { Injectable } from '@angular/core';
import { Subject, combineLatest, from, of } from 'rxjs';
import { map, switchScan, concatMap, delay } from 'rxjs/operators';
import { BASE, REVERSE_LOOKUP_LETTERS, getLettersFromTo, inputToBoardLetters } from './utils';

@Injectable({
  providedIn: 'root'
})
export class SplitFlapService {
  public getSplitFlapInstance() {
    const input$$ = new Subject<string>();

    const splitFlap$ = input$$.pipe(
      map(inputToBoardLetters),
      switchScan(
        (acc, lettersOnBoard) =>
          combineLatest(
            lettersOnBoard.map((letter, i) =>
              from(getLettersFromTo(acc[i], letter)).pipe(concatMap(letter => of(letter).pipe(delay(150)))),
            ),
          ),
        BASE,
      ),
    );

    return {
      input$$,
      splitFlap$,
    };
  }
}
