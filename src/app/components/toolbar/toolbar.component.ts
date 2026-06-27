import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrl: './toolbar.component.css'
})
export class ToolbarComponent {
  @Input() shouldShow: boolean = true;

  constructor(private router: Router) { }

  navigateToResources() {
    this.router.navigate(['/resources']);
  }

  performSearch() {
    this.router.navigate(['/advanced-search']);
  }

  navigateHome() {
    this.router.navigate(['/']);
  }

  navigateToTcoCalculator() {
    this.router.navigate(['/tco-calculator']);
  }
}
