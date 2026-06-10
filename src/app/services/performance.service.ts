import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable } from 'rxjs';
import { LoggerService } from './logger.service';

interface PerformanceMetric {
  name: string;
  startTime: number;
  endTime?: number;
  duration?: number;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceService {
  private metrics: Map<string, PerformanceMetric> = new Map();
  private loadingState = new BehaviorSubject<boolean>(true);
  private imageCache = new Map<string, HTMLImageElement>();

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: LoggerService
  ) {
    this.registerServiceWorker();
  }

  get isLoading$(): Observable<boolean> {
    return this.loadingState.asObservable();
  }

  setLoadingState(loading: boolean): void {
    this.loadingState.next(loading);
  }

  startMeasure(name: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const startTime = performance.now();
      this.metrics.set(name, {
        name,
        startTime
      });
      this.logger.debug(`Performance measurement started: ${name}`);
    }
  }

  endMeasure(name: string): number | null {
    if (isPlatformBrowser(this.platformId)) {
      const metric = this.metrics.get(name);
      if (metric) {
        const endTime = performance.now();
        const duration = endTime - metric.startTime;
        
        metric.endTime = endTime;
        metric.duration = duration;
        
        this.logger.info(`Performance measurement completed: ${name} - ${duration.toFixed(2)}ms`);
        
        // Log slow operations
        if (duration > 1000) {
          this.logger.warn(`Slow operation detected: ${name} took ${duration.toFixed(2)}ms`);
        }
        
        return duration;
      }
    }
    return null;
  }

  measureRouteChange(routeName: string): void {
    this.startMeasure(`route-${routeName}`);
    // This will be ended by the route transition service
  }

  measureComponentLoad(componentName: string): void {
    this.startMeasure(`component-${componentName}`);
  }

  measureApiCall(apiName: string): void {
    this.startMeasure(`api-${apiName}`);
  }

  getMetrics(): PerformanceMetric[] {
    return Array.from(this.metrics.values());
  }

  clearMetrics(): void {
    this.metrics.clear();
  }

  // Image optimization methods
  preloadImages(urls: string[]): Promise<void[]> {
    if (!isPlatformBrowser(this.platformId)) {
      return Promise.resolve([]);
    }
    
    const promises = urls.map(url => this.preloadImage(url));
    return Promise.all(promises);
  }

  preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!isPlatformBrowser(this.platformId)) {
        resolve();
        return;
      }

      if (this.imageCache.has(src)) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => {
        this.imageCache.set(src, img);
        this.logger.debug(`Image preloaded: ${src}`);
        resolve();
      };
      img.onerror = () => {
        this.logger.error(`Failed to preload image: ${src}`);
        reject(new Error(`Failed to load image: ${src}`));
      };
      img.src = src;
    });
  }

  // Register service worker for caching
  private registerServiceWorker(): void {
    if (isPlatformBrowser(this.platformId) && 'serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          this.logger.info('Service Worker registered successfully');
        })
        .catch((error) => {
          this.logger.error('Service Worker registration failed:', error);
        });
    }
  }

  // Measure Core Web Vitals
  measureWebVitals(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Largest Contentful Paint
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        const lastEntry = entries[entries.length - 1];
        this.logger.info(`LCP: ${lastEntry.startTime.toFixed(2)}ms`);
      }).observe({ entryTypes: ['largest-contentful-paint'] });

      // First Input Delay
      new PerformanceObserver((entryList) => {
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          this.logger.info(`FID: ${entry.processingStart - entry.startTime}ms`);
        });
      }).observe({ entryTypes: ['first-input'] });

      // Cumulative Layout Shift
      new PerformanceObserver((entryList) => {
        let clsValue = 0;
        const entries = entryList.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        this.logger.info(`CLS: ${clsValue}`);
      }).observe({ entryTypes: ['layout-shift'] });
    }
  }
}