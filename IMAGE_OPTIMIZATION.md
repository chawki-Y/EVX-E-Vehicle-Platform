# Image Optimization Guide

This guide explains how to use the image optimization features in EVX-Web to reduce image file sizes and improve loading performance.

## Overview

The image optimization system provides:
- **Automatic format selection** (WebP with fallbacks)
- **Responsive image sizing** based on viewport
- **Progressive loading** (low-res placeholder → high-res image)
- **Lazy loading** with intersection observer
- **Connection-aware quality adjustment**
- **Preloading for critical images**

## Components and Services

### 1. OptimizedImageComponent

A drop-in replacement for `<img>` tags with automatic optimization.

```html
<!-- Basic usage -->
<app-optimized-image 
  src="https://example.com/image.jpg" 
  alt="Description"
  width="400px"
  height="300px">
</app-optimized-image>

<!-- With priority and custom class -->
<app-optimized-image 
  [src]="product.image" 
  [alt]="product.name"
  imageClass="product-thumbnail"
  priority="high"
  width="100%"
  height="auto">
</app-optimized-image>
```

**Properties:**
- `src`: Image URL (required)
- `alt`: Alt text (required)
- `width`: CSS width (default: '100%')
- `height`: CSS height (default: 'auto')
- `imageClass`: CSS class to apply
- `priority`: Loading priority ('high' | 'normal' | 'low')
- `sizes`: Responsive sizes attribute

### 2. OptimizeImageDirective

Add to existing `<img>` tags for quick optimization.

```html
<!-- Basic optimization -->
<img src="assets/logo.png" 
     alt="Logo" 
     appOptimizeImage>

<!-- With custom settings -->
<img src="assets/hero-image.jpg" 
     alt="Hero" 
     appOptimizeImage
     [optimizeWidth]="1200"
     [optimizeQuality]="85"
     optimizeFormat="webp"
     [lazyLoad]="true">
```

**Properties:**
- `optimizeQuality`: Image quality 1-100 (default: 80)
- `optimizeWidth`: Target width in pixels
- `optimizeHeight`: Target height in pixels
- `optimizeFormat`: Output format ('webp' | 'jpg' | 'png')
- `lazyLoad`: Enable lazy loading (default: true)

### 3. ImageOptimizationService

Core service for generating optimized image URLs.

```typescript
import { ImageOptimizationService } from './services/image-optimization.service';

constructor(private imageOptimizer: ImageOptimizationService) {}

// Generate responsive image set
const imageSet = this.imageOptimizer.generateResponsiveImageSet(originalUrl);

// Get optimized URL with specific options
const optimizedUrl = this.imageOptimizer.getOptimizedImageUrl(originalUrl, {
  width: 800,
  height: 600,
  quality: 85,
  format: 'webp'
});

// Get placeholder for progressive loading
const placeholder = this.imageOptimizer.getPlaceholderImage(originalUrl);
```

### 4. ImageLoadingService

Advanced loading with progress tracking and preloading.

```typescript
import { ImageLoadingService } from './services/image-loading.service';

constructor(private imageLoader: ImageLoadingService) {}

// Preload critical images
await this.imageLoader.preloadImage(imageUrl, { priority: 'high' });

// Load with progress tracking
this.imageLoader.loadImageWithProgress(imageUrl).subscribe(state => {
  console.log('Loading:', state.isLoading);
  console.log('Progress:', state.progress);
  console.log('Error:', state.hasError);
});

// Preload multiple images
await this.imageLoader.preloadImages([url1, url2, url3]);
```

## Supported Image Sources

### 1. Unsplash Images
Automatically optimized using Unsplash's URL parameters:
```
Original: https://images.unsplash.com/photo-123456789
Optimized: https://images.unsplash.com/photo-123456789?w=800&h=600&q=80&fm=webp&fit=crop
```

### 2. Tesla Images
Optimized using Tesla's CDN parameters:
```
Original: https://digitalassets.tesla.com/tesla-contents/image/upload/image.jpg
Optimized: https://digitalassets.tesla.com/tesla-contents/image/upload/image.jpg?w=800&q=80
```

### 3. Local Assets
For local assets in `src/assets/`, use the optimization script:
```bash
./optimize-images.sh
```

This generates multiple sizes and formats:
- `image_thumb.webp` (100px width)
- `image_small.webp` (400px width)
- `image_medium.webp` (800px width)
- `image_large.webp` (1200px width)
- Plus JPG fallbacks for each size

## Best Practices

### 1. Choose the Right Component

**Use OptimizedImageComponent when:**
- Building new components
- Need full control over loading states
- Want progressive enhancement
- Require responsive sizing

**Use OptimizeImageDirective when:**
- Updating existing components
- Quick optimization wins
- Simple use cases

### 2. Set Appropriate Priorities

```html
<!-- Hero images: high priority -->
<app-optimized-image priority="high" src="hero.jpg">

<!-- Above-the-fold content: normal priority -->
<app-optimized-image priority="normal" src="product.jpg">

<!-- Below-the-fold content: low priority -->
<app-optimized-image priority="low" src="thumbnail.jpg">
```

### 3. Use Responsive Images

```html
<app-optimized-image 
  src="large-image.jpg"
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw">
</app-optimized-image>
```

### 4. Preload Critical Images

```typescript
ngOnInit() {
  // Preload hero images
  this.imageLoader.preloadImage(this.heroImage, { priority: 'high' });
  
  // Preload next page images
  this.imageLoader.preloadImages(this.nextPageImages, { priority: 'low' });
}
```

## Performance Benefits

### File Size Reduction
- **WebP format**: 25-35% smaller than JPEG
- **Quality optimization**: 20-40% reduction with minimal visual impact
- **Responsive sizing**: Load only what's needed

### Loading Performance
- **Lazy loading**: Images load only when needed
- **Progressive enhancement**: Show low-res placeholder immediately
- **Connection awareness**: Adjust quality based on network speed
- **Preloading**: Critical images ready before needed

### User Experience
- **Smooth loading**: No layout shifts with proper sizing
- **Error handling**: Graceful fallbacks for failed loads
- **Progress indication**: Visual feedback during loading

## Migration Guide

### Step 1: Update Critical Images
Replace hero and above-the-fold images first:

```html
<!-- Before -->
<img src="hero.jpg" alt="Hero">

<!-- After -->
<app-optimized-image src="hero.jpg" alt="Hero" priority="high">
```

### Step 2: Add Directive to Existing Images
For quick wins, add the directive:

```html
<!-- Before -->
<img src="product.jpg" alt="Product">

<!-- After -->
<img src="product.jpg" alt="Product" appOptimizeImage>
```

### Step 3: Optimize Local Assets
Run the optimization script:

```bash
./optimize-images.sh
```

### Step 4: Update Image References
Use optimized versions:

```html
<!-- Before -->
<img src="assets/logo.png">

<!-- After -->
<img src="assets/optimized/logo_medium.webp" appOptimizeImage>
```

## Monitoring and Debugging

### Check Loading States
```typescript
// Monitor image loading
this.imageLoader.getLoadingState(imageUrl).subscribe(state => {
  if (state.hasError) {
    console.error('Image failed to load:', imageUrl);
  }
});

// Check memory usage
const stats = this.imageLoader.getMemoryStats();
console.log('Loaded images:', stats.loadedImages);
console.log('Queue size:', stats.queueSize);
```

### Browser DevTools
1. **Network tab**: Check image sizes and formats
2. **Performance tab**: Monitor loading times
3. **Application tab**: Check cache usage

### Lighthouse Audit
The optimization system helps improve:
- **Largest Contentful Paint (LCP)**
- **Cumulative Layout Shift (CLS)**
- **First Contentful Paint (FCP)**

## Troubleshooting

### Common Issues

**Images not optimizing:**
- Check if the URL is supported (Unsplash, Tesla, local assets)
- Verify the directive is imported in the component
- Check browser console for errors

**WebP not working:**
- The system automatically falls back to JPEG
- Check browser support with `imageOptimizer.isWebPSupported()`

**Slow loading:**
- Reduce image quality for slower connections
- Use smaller sizes for mobile devices
- Preload critical images

**Memory issues:**
- Clear cache periodically: `imageLoader.clearCache()`
- Limit concurrent preloading
- Monitor memory usage

### Performance Tips

1. **Use appropriate image sizes**
2. **Set loading priorities correctly**
3. **Preload strategically**
4. **Monitor network conditions**
5. **Test on various devices and connections**

## Future Enhancements

Planned improvements:
- **AVIF format support** (next-gen image format)
- **CDN integration** (Cloudinary, ImageKit)
- **Advanced caching strategies**
- **Image compression analytics**
- **Automatic format detection**