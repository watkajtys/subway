import { Component, Input } from '@angular/core';
import { NavigationEnd, Router, RouterModule } from '@angular/router';
import { Location, CommonModule } from '@angular/common';
import { filter } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
  imports: [RouterModule, CommonModule],
})
export class HeaderComponent {
  @Input() title: string = '';
  isHomePage: boolean = false;

  constructor(private location: Location, private router: Router) {
    this.router.events
      .pipe(filter((event) => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.isHomePage = (event as NavigationEnd).urlAfterRedirects === '/';
      });
  }

  goBack(): void {
    this.location.back();
  }
}
