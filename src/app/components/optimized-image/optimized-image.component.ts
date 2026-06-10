import { 
  Component, 
  Input, 
  OnInit, 
  OnDestroy, 
  ElementRef, 
  ViewChild, 
  Inject, 
  PLATFORM_ID,
  ChangeDetectorRef 
} from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { ImageOptimizationService, ResponsiveImageSet } from '../../services/image-optimization.service';

@Component({
  selector: 'app-optimized-image',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="optimized-image-container" [style.width]="width" [style.height]="height">
      <!-- Placeholder/Low-res image -->
      <img 
        #placeholderImg
        [src]="placeholderSrc"
        [alt]="alt"
        [class]="imageClass + ' placeholder-image'"
        [style.filter]="showPlaceholder ? 'blur(5px)' : 'none'"
        [style.opacity]="showPlaceholder ? '0.7' : '0'"
        [style.transition]="'all 0.3s ease'"
        (load)="onPlaceholderLoad()"
        (error)="onImageError('placeholder')"
      />
      
      <!-- High-res image -->
      <img 
        #mainImg
        [src]="currentSrc"
        [alt]="alt"
        [class]="imageClass + ' main-image'"
        [style.opacity]="imageLoaded ? '1' : '0'"
        [style.transition]="'opacity 0.3s ease'"
        (load)="onMainImageLoad()"
        (error)="onImageError('main')"
        loading="lazy"
      />
      
      <!-- Loading indicator -->
      <div 
        class="loading-indicator" 
        *ngIf="isLoading"
        [style.opacity]="isLoading ? '1' : '0'"
      >
        <div class="spinner"></div>
      </div>
      
      <!-- Error state -->
      <div 
        class="error-state" 
        *ngIf="hasError"
        [style.opacity]="hasError ? '1' : '0'"
      >
        <div class="error-icon">⚠️</div>
        <div class="error-text">Failed to load image</div>
      </div>
    </div>
  `,
  styles: [`
    .optimized-image-container {
      position: relative;
      display: inline-block;
      overflow: hidden;
      background-color: #f0f0f0;
    }

    .placeholder-image,
    .main-image {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: opacity 0.3s ease;
    }

    .placeholder-image {
      z-index: 1;
    }

    .main-image {
      z-index: 2;
    }

    .loading-indicator {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 3;
      transition: opacity 0.3s ease;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid #f3f3f3;
      border-top: 2px solid #007bff;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-state {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      text-align: center;
      z-index: 3;
      color: #666;
      transition: opacity 0.3s ease;
    }

    .error-icon {
      font-size: 24px;
      margin-bottom: 8px;
    }

    .error-text {
      font-size: 12px;
      font-weight: 500;
    }

    /* Responsive behavior */
    @media (max-width: 768px) {
      .spinner {
        width: 20px;
        height: 20px;
      }
      
      .error-icon {
        font-size: 20px;
      }
      
      .error-text {
        font-size: 11px;
      }
    }
  `]
})
export class OptimizedImageComponent implements OnInit, OnDestroy {
  @Input() src: string = '';
  @Input() alt: string = '';
  @Input() width: string = '100%';
  @Input() height: string = 'auto';
  @Input() imageClass: string = '';
  @Input() priority: 'high' | 'normal' | 'low' = 'normal';
  @Input() sizes: string = '100vw'; // For responsive images
  
  @ViewChild('placeholderImg') placeholderImg!: ElementRef<HTMLImageElement>;
  @ViewChild('mainImg') mainImg!: ElementRef<HTMLImageElement>;

  currentSrc: string = '';
  placeholderSrc: string = '';
  imageSet: ResponsiveImageSet | null = null;
  
  isLoading: boolean = true;
  imageLoaded: boolean = false;
  showPlaceholder: boolean = true;
  hasError: boolean = false;
  
  private destroy$ = new Subject<void>();
  private intersectionObserver?: IntersectionObserver;
  private resizeObserver?: ResizeObserver;

  constructor(
    private imageOptimizationService: ImageOptimizationService,
    private elementRef: ElementRef,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      // For SSR, set a basic src and disable loading states
      this.currentSrc = this.src;
      this.placeholderSrc = this.src;
      this.isLoading = false;
      this.showPlaceholder = false;
      return;
    }

    this.initializeImage();
    this.setupIntersectionObserver();
    this.setupResizeObserver();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
    }
    
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private initializeImage(): void {
    if (!this.src) {
      this.hasError = true;
      this.isLoading = false;
      return;
    }

    // Generate responsive image set
    this.imageSet = this.imageOptimizationService.generateResponsiveImageSet(this.src);
    
    // Set placeholder image (very low quality)
    this.placeholderSrc = this.imageOptimizationService.getPlaceholderImage(this.src);
    
    // Set initial high-res image based on current viewport
    this.updateImageForViewport();
  }

  private setupIntersectionObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    const options = {
      root: null,
      rootMargin: '50px', // Start loading 50px before the image enters viewport
      threshold: 0.1
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.loadHighResImage();
          this.intersectionObserver?.unobserve(entry.target);
        }
      });
    }, options);

    this.intersectionObserver.observe(this.elementRef.nativeElement);
  }

  private setupResizeObserver(): void {
    if (!isPlatformBrowser(this.platformId)) return;

    this.resizeObserver = new ResizeObserver(() => {
      this.updateImageForViewport();
    });

    this.resizeObserver.observe(this.elementRef.nativeElement);
  }

  private updateImageForViewport(): void {
    if (!this.imageSet || !isPlatformBrowser(this.platformId)) return;

    const viewportWidth = window.innerWidth;
    const newSrc = this.imageOptimizationService.getImageForViewport(this.imageSet, viewportWidth);
    
    if (newSrc !== this.currentSrc) {
      this.currentSrc = newSrc;
      this.imageLoaded = false;
      this.cdr.detectChanges();
    }
  }

  private loadHighResImage(): void {
    if (this.priority === 'high') {
      // For high priority images, load immediately
      this.updateImageForViewport();
    } else {
      // For normal/low priority, add a small delay to prevent overwhelming the browser
      const delay = this.priority === 'low' ? 200 : 100;
      setTimeout(() => {
        this.updateImageForViewport();
      }, delay);
    }
  }

  onPlaceholderLoad(): void {
    // Placeholder loaded, we can show it
    this.showPlaceholder = true;
    this.cdr.detectChanges();
  }

  onMainImageLoad(): void {
    this.imageLoaded = true;
    this.isLoading = false;
    this.showPlaceholder = false;
    this.hasError = false;
    this.cdr.detectChanges();
  }

  onImageError(type: 'placeholder' | 'main'): void {
    if (type === 'main') {
      // If main image fails, try to fallback to original src
      if (this.currentSrc !== this.src) {
        this.currentSrc = this.src;
        return;
      }
      
      // If original also fails, show error state
      this.hasError = true;
      this.isLoading = false;
      this.showPlaceholder = false;
    }
    
    this.cdr.detectChanges();
  }

  // Public method to retry loading
  retryLoad(): void {
    this.hasError = false;
    this.isLoading = true;
    this.imageLoaded = false;
    this.showPlaceholder = true;
    this.initializeImage();
  }
}