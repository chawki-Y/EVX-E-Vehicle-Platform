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
  
  // Reordered suggestions for better visual flow
  searchSuggestions: string[] = [
    'Tesla Model S',
    'BMW iX', 
    'Porsche Taycan',
    'Ford Mustang Mach-E',
    'Hyundai IONIQ 5',
    'Kia EV6',
    'Long Range EVs',
    'Fast Charging'
  ];

  constructor(private router: Router) {}

  performSearch() {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/advanced-search'], { queryParams: { q: this.searchQuery } });
    }
  }
  
  selectSuggestion(suggestion: string) {
    this.searchQuery = suggestion;
    this.performSearch();
  }
}
