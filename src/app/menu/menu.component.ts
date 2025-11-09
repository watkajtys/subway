import { Component, EventEmitter, Input, Output, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoriteCardComponent } from '../favorite-card/favorite-card';
import { FavoritesService } from '../favorites.service';
import { RouterLink } from '@angular/router';
import { StateService } from '../state.service';
import { Alert } from '../generated/gtfs-realtime';

@Component({
  selector: 'app-menu',
  standalone: true,
  imports: [CommonModule, FavoriteCardComponent, RouterLink],
  templateUrl: './menu.html',
  styleUrl: './menu.css',
})
export class Menu {
  @Input() visible = false;
  @Output() close = new EventEmitter<void>();

  private favoritesService = inject(FavoritesService);
  private stateService = inject(StateService);

  protected favorites = this.favoritesService.favorites;

  protected alerts = computed(() => {
    const favorites = this.favorites();
    const favoriteRoutes = new Set(favorites.map(fav => fav.lineId));

    return this.stateService.alerts().filter(alert => {
      return alert.informedEntity.some(entity => {
        return entity.routeId && favoriteRoutes.has(entity.routeId);
      });
    });
  });

  onClose() {
    this.close.emit();
  }
}
