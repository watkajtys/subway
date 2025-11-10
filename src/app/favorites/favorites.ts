import { Component, inject } from '@angular/core';
import { MetaService } from '../meta.service';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../favorites.service';
import { FavoriteCardComponent } from '../favorite-card/favorite-card';
import { HeaderComponent } from '../header/header';
import { RouterModule, Router } from '@angular/router';

@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule, FavoriteCardComponent, HeaderComponent, RouterModule],
  templateUrl: './favorites.html',
  styleUrls: ['./favorites.css'],
})
export class FavoritesComponent {
  protected favoritesService = inject(FavoritesService);

  constructor(private metaService: MetaService, private router: Router) {
    this.metaService.updateTags(
      'Favorites | Did I Miss My Train?',
      "Live MTA subway departure times for New York City",
      this.router.url
    );
  }
}
