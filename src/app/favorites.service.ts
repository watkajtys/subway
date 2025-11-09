import { Injectable, signal, effect } from '@angular/core';

export interface Favorite {
  stationId: string;
  lineId: string;
  direction: 'Uptown' | 'Downtown';
}

@Injectable({
  providedIn: 'root',
})
export class FavoritesService {
  private readonly localStorageKey = 'mta-departure-board-favorites';
  readonly favorites = signal<Favorite[]>(this.loadFavorites());

  constructor() {
    effect(() => {
      this.saveFavorites(this.favorites());
    });
  }

  addFavorite(favorite: Favorite): void {
    if (!this.isFavorite(favorite)) {
      this.favorites.update(favorites => [...favorites, favorite]);
    }
  }

  removeFavorite(favorite: Favorite): void {
    this.favorites.update(favorites =>
      favorites.filter(
        f =>
          f.stationId !== favorite.stationId ||
          f.lineId !== favorite.lineId ||
          f.direction !== favorite.direction
      )
    );
  }

  isFavorite(favorite: Favorite): boolean {
    return this.favorites().some(
      f =>
        f.stationId === favorite.stationId &&
        f.lineId === favorite.lineId &&
        f.direction === favorite.direction
    );
  }

  toggleFavorite(favorite: Favorite): void {
    if (this.isFavorite(favorite)) {
      this.removeFavorite(favorite);
    } else {
      this.addFavorite(favorite);
    }
  }

  private loadFavorites(): Favorite[] {
    if (typeof window !== 'undefined') {
      const favoritesJson = window.localStorage.getItem(this.localStorageKey);
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    }
    return [];
  }

  private saveFavorites(favorites: Favorite[]): void {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(this.localStorageKey, JSON.stringify(favorites));
    }
  }
}
