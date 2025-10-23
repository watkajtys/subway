export const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 .,!?\'';
export const REVERSE_LOOKUP_LETTERS: { [key: string]: number } = LETTERS.split('').reduce((acc, letter, i) => ({ ...acc, [letter]: i }), {});
export const BASE = Array(10).fill(LETTERS[0]);

export function inputToBoardLetters(input: string) {
  return input
    .toUpperCase()
    .split('')
    .concat(BASE)
    .slice(0, BASE.length);
}

export function getLettersFromTo(from: string, to: string) {
  const fromIndex = REVERSE_LOOKUP_LETTERS[from];
  const toIndex = REVERSE_LOOKUP_LETTERS[to];

  if (fromIndex === toIndex) {
    return [from];
  }

  const letters: string[] = [];
  let currentIndex = fromIndex;
  while (currentIndex !== toIndex) {
    letters.push(LETTERS[currentIndex]);
    currentIndex = (currentIndex + 1) % LETTERS.length;
  }
  letters.push(LETTERS[toIndex]);
  return letters;
}
