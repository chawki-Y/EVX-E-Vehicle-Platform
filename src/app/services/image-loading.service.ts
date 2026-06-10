import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, from } from 'rxjs';
import { ImageOptimizationService } from './image-optimization.service';

export interface ImageLoadingState {
  isLoading: boolean;
  hasError: boolean;
  progress: number;
}

export interface ImagePreloadOptions {
  priority: 'high' | 'normal' | 'low';
  sizes?: string[];
  formats?: ('webp' | 'jpg' | 'png')[];
}

@Injectable({
  providedIn: 'root'
})
export class ImageLoadingService {
  private loadingStates = new Map<string, BehaviorSubject<ImageLoadingState>>();
  private loadedImages = new Set<string>();
  private preloadQueue: Array<{ url: string; options: ImagePreloadOptions }> = [];
  private isProcessingQueue = false;

  constructor(
    private imageOptimizationService: ImageOptimizationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      this.initializePreloadQueue();
    }
  }

  /**
   * Get loading state for a specific image
   */
  getLoadingState(url: string): Observable<ImageLoadingState> {
    if (!this.loadingStates.has(url)) {
      this.loadingStates.set(url, new BehaviorSubject<ImageLoadingState>({
        isLoading: false,
        hasError: false,
        progress: 0
      }));
    }
    return this.loadingStates.get(url)!.asObservable();
  }

  /**
   * Preload an image with optimization
   */
  preloadImage(url: string, options: ImagePreloadOptions = { priority: 'normal' }): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve();
    }

    if (this.loadedImages.has(url)) {
      return Promise.resolve();
    }

    // Add to queue based on priority
    if (options.priority === 'high') {
      this.preloadQueue.unshift({ url, options });
    } else {
      this.preloadQueue.push({ url, options });
    }

    this.processPreloadQueue();

    return this.loadSingleImage(url);
  }

  /**
   * Preload multiple images
   */
  preloadImages(urls: string[], options: ImagePreloadOptions = { priority: 'normal' }): Promise<void[]> {
    const promises = urls.map(url => this.preloadImage(url, options));
    return Promise.all(promises);
  }

  /**
   * Load image with progress tracking
   */
  loadImageWithProgress(url: string): Observable<ImageLoadingState> {
    const state$ = this.getLoadingState(url);
    
    if (!this.loadedImages.has(url)) {
      this.loadImageWithProgressTracking(url);
    }

    return state$;
  }

  /**
   * Get optimized image URL for current conditions
   */
  getOptimizedImageUrl(originalUrl: string, targetWidth?: number): string {
    if (!isPlatformBrowser(this.platformId)) {
      return originalUrl;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const connectionSpeed = this.getConnectionSpeed();
    
    // Adjust quality based on connection speed
    let quality = 80;
    if (connectionSpeed === 'slow') {
      quality = 60;
    } else if (connectionSpeed === 'fast') {
      quality = 90;
    }

    // Adjust width based on device pixel ratio
    const optimizedWidth = targetWidth ? Math.round(targetWidth * devicePixelRatio) : undefined;

    return this.imageOptimizationService.getOptimizedImageUrl(originalUrl, {
      width: optimizedWidth,
      quality,
      format: this.getBestFormat()
    });
  }

  /**
   * Clear cache and reset loading states
   */
  clearCache(): void {
    this.loadedImages.clear();
    this.loadingStates.clear();
    this.preloadQueue.length = 0;
  }

  /**
   * Get memory usage statistics
   */
  getMemoryStats(): { loadedImages: number; queueSize: number } {
    return {
      loadedImages: this.loadedImages.size,
      queueSize: this.preloadQueue.length
    };
  }

  private initializePreloadQueue(): void {
    // Process queue every 100ms to avoid overwhelming the browser
    setInterval(() => {
      if (!this.isProcessingQueue && this.preloadQueue.length > 0) {
        this.processPreloadQueue();
      }
    }, 100);
  }

  private async processPreloadQueue(): Promise<void> {
    if (this.isProcessingQueue || this.preloadQueue.length === 0) {
      return;
    }

    this.isProcessingQueue = true;

    // Process up to 3 images at a time to avoid overwhelming the browser
    const batch = this.preloadQueue.splice(0, 3);
    
    const promises = batch.map(({ url }) => this.loadSingleImage(url));
    
    try {
      await Promise.all(promises);
    } catch (error) {
      console.warn('Some images failed to preload:', error);
    }

    this.isProcessingQueue = false;
  }

  private loadSingleImage(url: string): Promise<void> {
    if (this.loadedImages.has(url)) {
      return Promise.resolve();
    }

    const state = this.loadingStates.get(url);
    if (state) {
      state.next({ isLoading: true, hasError: false, progress: 0 });
    }

    return new Promise((resolve, reject) => {
      const img = new Image();
      
      img.onload = () => {
        this.loadedImages.add(url);
        if (state) {
          state.next({ isLoading: false, hasError: false, progress: 100 });
        }
        resolve();
      };

      img.onerror = () => {
        if (state) {
          state.next({ isLoading: false, hasError: true, progress: 0 });
        }
        reject(new Error(`Failed to load image: ${url}`));
      };

      // Simulate progress for better UX
      let progress = 0;
      const progressInterval = setInterval(() => {
        progress += Math.random() * 20;
        if (progress >= 90) {
          clearInterval(progressInterval);
          progress = 90;
        }
        if (state) {
          const currentState = state.value;
          if (currentState.isLoading) {
            state.next({ ...currentState, progress });
          }
        }
      }, 100);

      img.src = url;
    });
  }

  private loadImageWithProgressTracking(url: string): void {
    const state = this.loadingStates.get(url);
    if (!state) return;

    state.next({ isLoading: true, hasError: false, progress: 0 });

    // Use fetch for better progress tracking if available
    if ('fetch' in window) {
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const contentLength = response.headers.get('content-length');
          if (!contentLength) {
            // Fallback to basic loading
            this.loadSingleImage(url).catch(() => {
              if (state) {
                state.next({ isLoading: false, hasError: true, progress: 0 });
              }
            });
            return;
          }

          const total = parseInt(contentLength, 10);
          let loaded = 0;

          const reader = response.body?.getReader();
          if (!reader) {
            this.loadSingleImage(url).catch(() => {
              if (state) {
                state.next({ isLoading: false, hasError: true, progress: 0 });
              }
            });
            return;
          }

          const stream = new ReadableStream({
            start(controller) {
              function pump(): Promise<void> {
                return reader!.read().then(({ done, value }) => {
                  if (done) {
                    controller.close();
                    return;
                  }

                  loaded += value?.length || 0;
                  const progress = Math.round((loaded / total) * 100);
                  
                  if (state) {
                    state.next({ isLoading: true, hasError: false, progress });
                  }
                  
                  controller.enqueue(value);
                  return pump();
                });
              }
              return pump();
            }
          });

          return new Response(stream).blob().then(blob => {
            const img = new Image();
            img.onload = () => {
              this.loadedImages.add(url);
              if (state) {
                state.next({ isLoading: false, hasError: false, progress: 100 });
              }
            };
            img.onerror = () => {
              if (state) {
                state.next({ isLoading: false, hasError: true, progress: 0 });
              }
            };
            img.src = URL.createObjectURL(blob);
          });
        })
        .catch(() => {
          if (state) {
            state.next({ isLoading: false, hasError: true, progress: 0 });
          }
        });
    } else {
      // Fallback for browsers without fetch
      this.loadSingleImage(url).catch(() => {
        if (state) {
          state.next({ isLoading: false, hasError: true, progress: 0 });
        }
      });
    }
  }

  private getConnectionSpeed(): 'slow' | 'normal' | 'fast' {
    if (!isPlatformBrowser(this.platformId)) {
      return 'normal';
    }

    // Use Network Information API if available
    const connection = (navigator as any).connection || (navigator as any).mozConnection || (navigator as any).webkitConnection;
    
    if (connection) {
      const effectiveType = connection.effectiveType;
      if (effectiveType === 'slow-2g' || effectiveType === '2g') {
        return 'slow';
      } else if (effectiveType === '4g') {
        return 'fast';
      }
    }

    return 'normal';
  }

  private getBestFormat(): 'webp' | 'jpg' {
    if (!isPlatformBrowser(this.platformId)) {
      return 'jpg';
    }

    // Check WebP support
    const canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = 1;
    
    try {
      const webpSupported = canvas.toDataURL('image/webp').indexOf('data:image/webp') === 0;
      return webpSupported ? 'webp' : 'jpg';
    } catch {
      return 'jpg';
    }
  }
}