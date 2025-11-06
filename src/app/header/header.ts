import { Component, Input } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.html',
  styleUrl: './header.css',
  standalone: true,
  imports: [RouterModule],
})
export class HeaderComponent {
  @Input() title: string = '';
}
