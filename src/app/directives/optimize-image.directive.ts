import { 
  Directive, 
  ElementRef, 
  Input, 
  OnInit, 
  OnDestroy, 
  Inject, 
  PLATFORM_ID,
  Renderer2 
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ImageOptimizationService } from '../services/image-optimization.service';

@Directive({
  selector: 'img[appOptimizeImage]',
  standalone: true
})
export class OptimizeImageDirective implements OnInit, OnDestroy {
  @Input() optimizeQuality: number = 80;
  @Input() optimizeWidth?: number;
  @Input() optimizeHeight?: number;
  @Input() optimizeFormat: 'webp' | 'jpg' | 'png' = 'webp';
  @Input() lazyLoad: boolean = true;

  private originalSrc: string = '';
  private intersectionObserver?: IntersectionObserver;
  private isLoaded: boolean = false;

  constructor(
    private elementRef: ElementRef<HTMLImageElement>,
    private renderer: Renderer2,
    private imageOptimizationService: ImageOptimizationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const img = this.elementRef.nativeElement;
    this.originalSrc = img.src || img.getAttribute('src') || '';

    if (!this.originalSrc) {
      return;
    }

    // Add loading attribute for native lazy loading
    if (this.lazyLoad) {
      this.renderer.setAttribute(img, 'loading', 'lazy');
    }

    // Set up intersection observer for custom lazy loading
    if (this.lazyLoad) {
      this.setupIntersectionObserver();
    } else {
      this.optimizeImage();
    }

    // Add error handling
    this.renderer.listen(img, 'error', () => {
      this.handleImageError();
    });
  }

  ngOnDestroy(): void {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
  }

  private setupIntersectionObserver(): void {
    const options = {
      root: null,
      rootMargin: '50px',
      threshold: 0.1
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.isLoaded) {
          this.optimizeImage();
          this.intersectionObserver?.unobserve(entry.target);
        }
      });
    }, options);

    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  private optimizeImage(): void {
    if (this.isLoaded) return;

    const img = this.elementRef.nativeElement;
    
    // Get optimized image URL
    const optimizedSrc = this.imageOptimizationService.getOptimizedImageUrl(this.originalSrc, {
      width: this.optimizeWidth,
      height: this.optimizeHeight,
      quality: this.optimizeQuality,
      format: this.optimizeFormat
    });

    // Create a new image to preload
    const preloadImg = new Image();
    
    preloadImg.onload = () => {
      // Update the src once the optimized image is loaded
      this.renderer.setAttribute(img, 'src', optimizedSrc);
      this.isLoaded = true;
    };

    preloadImg.onerror = () => {
      // If optimized image fails, fallback to original
      this.handleImageError();
    };

    preloadImg.src = optimizedSrc;
  }

  private handleImageError(): void {
    const img = this.elementRef.nativeElement;
    
    // Fallback to original source if optimization fails
    if (img.src !== this.originalSrc) {
      this.renderer.setAttribute(img, 'src', this.originalSrc);
    }
  }
}