import { Component, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../favorites.service';
import { FavoriteCardComponent } from '../favorite-card/favorite-card';
import { HeaderComponent } from '../header/header';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FavoriteCardComponent, HeaderComponent, RouterModule],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class FavoritesComponent {
  protected favoritesService = inject(FavoritesService);

  constructor(private titleService: Title) {
    this.titleService.setTitle('Favorites | Did I Miss My Train?');
  }
}
