import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  searchQuery: string = '';
  
  readonly searchSuggestions: string[] = [
    'Tesla Model 3',
    'BMW iX', 
    'Porsche Taycan',
    'Renault Scenic',
    'Hyundai IONIQ 6',
    'Kia EV6',
  ];

  constructor(private router: Router) {}

  performSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/advanced-search'], { queryParams: { q: this.searchQuery } });
    }
  }
  
  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.performSearch();
  }
}
