import { Injectable } from '@angular/core';

export interface ImageOptions {
  width?: number;
  height?: number;
  quality?: number;
  format?: 'webp' | 'jpg' | 'png';
  blur?: boolean; // For placeholder/low-res images
}

export interface ResponsiveImageSet {
  thumbnail: string;    // Very small, for initial load
  small: string;        // Mobile/small screens
  medium: string;       // Tablet/medium screens
  large: string;        // Desktop/large screens
  original: string;     // Full resolution
}

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  private readonly UNSPLASH_BASE = 'https://images.unsplash.com';
  private readonly TESLA_BASE = 'https://digitalassets.tesla.com';
  
  constructor() { }

  /**
   * Generate optimized image URLs for different screen sizes
   */
  generateResponsiveImageSet(originalUrl: string): ResponsiveImageSet {
    if (this.isUnsplashUrl(originalUrl)) {
      return this.generateUnsplashResponsiveSet(originalUrl);
    } else if (this.isTeslaUrl(originalUrl)) {
      return this.generateTeslaResponsiveSet(originalUrl);
    } else if (this.isLocalAsset(originalUrl)) {
      return this.generateLocalAssetResponsiveSet(originalUrl);
    } else {
      // For other external URLs, return the same URL for all sizes
      // In a real app, you might use a service like Cloudinary or ImageKit
      return {
        thumbnail: originalUrl,
        small: originalUrl,
        medium: originalUrl,
        large: originalUrl,
        original: originalUrl
      };
    }
  }

  /**
   * Get optimized image URL with specific options
   */
  getOptimizedImageUrl(originalUrl: string, options: ImageOptions = {}): string {
    const {
      width = 800,
      height,
      quality = 80,
      format = 'webp',
      blur = false
    } = options;

    if (this.isUnsplashUrl(originalUrl)) {
      return this.optimizeUnsplashUrl(originalUrl, { width, height, quality, format, blur });
    } else if (this.isTeslaUrl(originalUrl)) {
      return this.optimizeTeslaUrl(originalUrl, { width, height, quality, format });
    } else if (this.isLocalAsset(originalUrl)) {
      // For local assets, we'll return the original URL
      // In production, you might want to pre-generate optimized versions
      return originalUrl;
    }

    return originalUrl;
  }

  /**
   * Generate a low-quality placeholder image
   */
  getPlaceholderImage(originalUrl: string): string {
    return this.getOptimizedImageUrl(originalUrl, {
      width: 50,
      quality: 20,
      blur: true
    });
  }

  /**
   * Get the best image size for current viewport
   */
  getImageForViewport(imageSet: ResponsiveImageSet, viewportWidth: number): string {
    if (viewportWidth <= 480) {
      return imageSet.small;
    } else if (viewportWidth <= 768) {
      return imageSet.medium;
    } else if (viewportWidth <= 1200) {
      return imageSet.large;
    } else {
      return imageSet.original;
    }
  }

  private isUnsplashUrl(url: string): boolean {
    return url.includes('unsplash.com');
  }

  private isTeslaUrl(url: string): boolean {
    return url.includes('digitalassets.tesla.com');
  }

  private isLocalAsset(url: string): boolean {
    return url.startsWith('assets/') || url.startsWith('/assets/');
  }

  private generateUnsplashResponsiveSet(originalUrl: string): ResponsiveImageSet {
    const baseUrl = this.extractUnsplashBaseUrl(originalUrl);
    
    return {
      thumbnail: `${baseUrl}?w=100&h=75&q=20&fm=webp&fit=crop`,
      small: `${baseUrl}?w=400&h=300&q=70&fm=webp&fit=crop`,
      medium: `${baseUrl}?w=800&h=600&q=80&fm=webp&fit=crop`,
      large: `${baseUrl}?w=1200&h=900&q=85&fm=webp&fit=crop`,
      original: `${baseUrl}?w=1600&h=1200&q=90&fm=webp&fit=crop`
    };
  }

  private generateTeslaResponsiveSet(originalUrl: string): ResponsiveImageSet {
    // Tesla's CDN supports some optimization parameters
    const baseUrl = originalUrl.split('?')[0]; // Remove existing params
    
    return {
      thumbnail: `${baseUrl}?w=100&q=20`,
      small: `${baseUrl}?w=400&q=70`,
      medium: `${baseUrl}?w=800&q=80`,
      large: `${baseUrl}?w=1200&q=85`,
      original: `${baseUrl}?w=1600&q=90`
    };
  }

  private generateLocalAssetResponsiveSet(originalUrl: string): ResponsiveImageSet {
    // For local assets, return the same URL for all sizes
    // In production, you would pre-generate different sizes
    return {
      thumbnail: originalUrl,
      small: originalUrl,
      medium: originalUrl,
      large: originalUrl,
      original: originalUrl
    };
  }

  private optimizeUnsplashUrl(originalUrl: string, options: ImageOptions): string {
    const baseUrl = this.extractUnsplashBaseUrl(originalUrl);
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format) params.set('fm', options.format);
    if (options.blur) params.set('blur', '5');
    
    params.set('fit', 'crop');
    params.set('auto', 'format');
    
    return `${baseUrl}?${params.toString()}`;
  }

  private optimizeTeslaUrl(originalUrl: string, options: ImageOptions): string {
    const baseUrl = originalUrl.split('?')[0];
    const params = new URLSearchParams();
    
    if (options.width) params.set('w', options.width.toString());
    if (options.height) params.set('h', options.height.toString());
    if (options.quality) params.set('q', options.quality.toString());
    if (options.format && options.format !== 'webp') {
      // Tesla might not support webp, fallback to jpg
      params.set('f', 'jpg');
    }
    
    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl;
  }

  private extractUnsplashBaseUrl(url: string): string {
    // Extract the base URL without parameters
    const urlParts = url.split('?');
    return urlParts[0];
  }

  /**
   * Preload critical images
   */
  preloadImage(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject(new Error(`Failed to load image: ${url}`));
      img.src = url;
    });
  }

  /**
   * Check if WebP is supported by the browser
   */
  isWebPSupported(): Promise<boolean> {
    return new Promise((resolve) => {
      const webP = new Image();
      webP.onload = webP.onerror = () => {
        resolve(webP.height === 2);
      };
      webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
    });
  }
}