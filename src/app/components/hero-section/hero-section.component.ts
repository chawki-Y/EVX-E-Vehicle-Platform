import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ViewChildren, QueryList, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-hero-section',
  standalone: true,
  imports: [CommonModule, SearchBarComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.css'
})
export class HeroSectionComponent implements OnInit, AfterViewInit, OnDestroy {
  currentSlide: number = 0;
  images: string[] = [
    'assets/ElectricCar1.jpg',
    'assets/ElectricCar2.jpg',
  ];
  private intervalId: any;

  constructor(@Inject(PLATFORM_ID) private platformId: any) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startAutoSlide();
    }
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.applyZoom();
    }, 100);
  }

  startAutoSlide() {
    this.intervalId = setInterval(() => {
      this.nextSlide();
    }, 10000);
  }

  resetAutoSlide() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.startAutoSlide();
  }

  ngOnDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  @ViewChildren('slide') slides!: QueryList<ElementRef>;
  zoomTimeout: any;

  applyZoom() {
    const slideEl = this.slides.toArray()[this.currentSlide]?.nativeElement;
  
    if (slideEl) {
      // First, reset the zoom to 1 (normal size)
      slideEl.style.transition = 'transform 0.5s ease-in-out'; // Set slow transition for reset
      slideEl.style.transform = 'scale(1)'; // Reset zoom to normal scale
  
      // Apply zoom-in with a slight delay to ensure smooth transition
      setTimeout(() => {
        slideEl.style.transition = 'transform 1.5s ease-in-out'; // Slower zoom-in
        slideEl.style.transform = 'scale(1.1)'; // Apply zoom-in with a smooth transition
      }, 200); // Delay for 100ms before zooming in
    }
  }
  

  setSlide(index: number) {
    this.currentSlide = index;
    this.applyZoom();
    this.resetAutoSlide();
  }

  nextSlide() {
    this.currentSlide = (this.currentSlide + 1) % this.images.length;
    this.applyZoom();
    this.resetAutoSlide();
  }

  previousSlide() {
    this.currentSlide = this.currentSlide === 0 ? this.images.length - 1 : this.currentSlide - 1;
    this.applyZoom();
    this.resetAutoSlide();
  }
}
