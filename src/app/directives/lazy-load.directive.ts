import { Directive, ElementRef, EventEmitter, OnDestroy, OnInit, Output, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Directive({
  selector: '[appLazyLoad]',
  standalone: true
})
export class LazyLoadDirective implements OnInit, OnDestroy {
  @Output() inView = new EventEmitter<boolean>();
  
  private observer?: IntersectionObserver;
  private isBrowser: boolean;

  constructor(
    private elementRef: ElementRef,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngOnInit(): void {
    if (this.isBrowser) {
      this.createObserver();
    } else {
      // For SSR, immediately emit true to load images
      setTimeout(() => this.inView.emit(true), 0);
    }
  }

  ngOnDestroy(): void {
    if (this.observer) {
      this.observer.disconnect();
    }
  }

  private createObserver(): void {
    // Double-check browser environment and IntersectionObserver support
    if (!this.isBrowser || typeof IntersectionObserver === 'undefined') {
      // Fallback: immediately emit true
      setTimeout(() => this.inView.emit(true), 0);
      return;
    }

    const options = {
      root: null,
      rootMargin: '50px', // Start loading 50px before element comes into view
      threshold: 0.1
    };

    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.inView.emit(true);
          // Disconnect after first intersection to avoid multiple triggers
          this.observer?.unobserve(entry.target);
        }
      });
    }, options);

    this.observer.observe(this.elementRef.nativeElement);
  }
}