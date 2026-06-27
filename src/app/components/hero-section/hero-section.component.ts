import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, OnDestroy, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterLink } from '@angular/router';
import { SearchBarComponent } from '../search-bar/search-bar.component';

interface HeroSlide {
  image: string;
  label: string;
}

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBarComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent implements OnInit, OnDestroy {
  readonly slides: HeroSlide[] = [
    { image: 'assets/vehicles/renault-scenic.jpg', label: 'Renault Scenic E-Tech' },
    { image: 'assets/vehicles/tesla-model-3.jpg', label: 'Tesla Model 3' }
  ];

  currentSlide = 0;
  private intervalId?: ReturnType<typeof setInterval>;

  constructor(@Inject(PLATFORM_ID) private readonly platformId: object) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.intervalId = setInterval(() => this.showNext(), 8000);
    }
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  selectSlide(index: number): void {
    this.currentSlide = index;
  }

  showNext(): void {
    this.currentSlide = (this.currentSlide + 1) % this.slides.length;
  }

  showPrevious(): void {
    this.currentSlide = (this.currentSlide - 1 + this.slides.length) % this.slides.length;
  }
}
