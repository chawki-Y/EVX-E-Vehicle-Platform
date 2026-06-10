import { Component, OnInit, ChangeDetectionStrategy, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { LazyLoadDirective } from '../../directives/lazy-load.directive';
import { PerformanceService } from '../../services/performance.service';
import { Subject, takeUntil } from 'rxjs';

interface Vehicle {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  imagePlaceholder?: string; // Low-quality placeholder
  range: number;
  year: number;
  condition: string;
  category: string;
  rating: number;
  reviews: number;
  isLiked: boolean;
  isCompared: boolean;
  isElectric: boolean;
  badge?: string;
  features: string[];
  batterySize: string;
  chargingTime: string;
  imageLoaded?: boolean; // Track image loading state
}

interface Testimonial {
  id: number;
  name: string;
  avatar: string;
  content: string;
  rating: number;
  vehicle: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, HeroSectionComponent, RouterModule, FooterComponent, LazyLoadDirective],  
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private isBrowser: boolean;
  
  // Loading states for better UX
  isLoading = true;
  imagesLoaded = 0;
  totalImages = 0;

  constructor(
    private performanceService: PerformanceService,
    @Inject(PLATFORM_ID) platformId: Object
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }
  featuredVehicles: Vehicle[] = [
    {
      id: 1,
      name: 'Renault Scenic E-Tech',
      brand: 'Renault',
      price: 42500,
      originalPrice: 45000,
      image: 'assets/optimized/default-car-optimized.jpg',
      imagePlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
      range: 379,
      year: 2025,
      condition: 'new',
      category: 'SUV',
      rating: 4.8,
      reviews: 156,
      isLiked: false,
      isCompared: false,
      isElectric: true,
      badge: 'NEW ARRIVAL',
      features: ['Adaptive Cruise Control', 'Wireless Charging', 'Premium Audio'],
      batterySize: '87 kWh',
      chargingTime: '30 min (10-80%)',
      imageLoaded: false
    },
    {
      id: 2,
      name: 'Hyundai IONIQ 6',
      brand: 'Hyundai',
      price: 48900,
      image: 'assets/optimized/ElectricCar1-optimized.jpg',
      imagePlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
      range: 425,
      year: 2024,
      condition: 'new',
      category: 'Sedan',
      rating: 4.9,
      reviews: 203,
      isLiked: true,
      isCompared: false,
      isElectric: true,
      badge: 'BEST SELLER',
      features: ['Digital Cockpit', 'Vehicle-to-Load', 'Smart Parking'],
      batterySize: '77.4 kWh',
      chargingTime: '18 min (10-80%)',
      imageLoaded: false
    },
    {
      id: 3,
      name: 'Tesla Model 3',
      brand: 'Tesla',
      price: 39990,
      image: 'assets/optimized/ElectricCar2-optimized.jpg',
      imagePlaceholder: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkxvYWRpbmcuLi48L3RleHQ+PC9zdmc+',
      range: 358,
      year: 2024,
      condition: 'new',
      category: 'Sedan',
      rating: 4.7,
      reviews: 892,
      isLiked: false,
      isCompared: false,
      isElectric: true,
      badge: 'POPULAR',
      features: ['Autopilot', 'Supercharging', 'Over-the-air Updates'],
      batterySize: '75 kWh',
      chargingTime: '25 min (10-80%)',
      imageLoaded: false
    }
  ];

  testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'Sarah Johnson',
      avatar: 'assets/person1.jpg',
      content: 'Amazing experience! The electric vehicle exceeded all my expectations. Silent, powerful, and eco-friendly.',
      rating: 5,
      vehicle: 'Tesla Model 3 Owner'
    },
    {
      id: 2,
      name: 'Michael Chen',
      avatar: 'assets/person2.jpg',
      content: 'Best decision I ever made. The cost savings on fuel and maintenance are incredible, plus it\'s so smooth to drive.',
      rating: 5,
      vehicle: 'Hyundai IONIQ 6 Owner'
    },
    {
      id: 3,
      name: 'Emily Rodriguez',
      avatar: 'assets/person3.jpg',
      content: 'Love the advanced technology and features. The charging network is expanding rapidly, making long trips easy.',
      rating: 4,
      vehicle: 'Renault Scenic E-Tech Owner'
    }
  ];

  ngOnInit(): void {
    this.performanceService.startMeasure('home-component-load');
    
    // Initialize total images count
    this.totalImages = this.featuredVehicles.length + this.testimonials.length;
    
    // Preload critical images using performance service
    this.preloadCriticalImagesOptimized();
    
    // Set initial loading state to false after a short delay to show content
    setTimeout(() => {
      this.isLoading = false;
      this.performanceService.setLoadingState(false);
      this.performanceService.endMeasure('home-component-load');
    }, 100);

    // Start measuring web vitals
    this.performanceService.measureWebVitals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private preloadCriticalImagesOptimized(): void {
    // Preload the first vehicle image (above the fold) using performance service
    if (this.featuredVehicles.length > 0) {
      const firstVehicle = this.featuredVehicles[0];
      
      // Directly preload the image using performance service
      this.performanceService.preloadImage(firstVehicle.image)
        .then(() => {
          firstVehicle.imageLoaded = true;
          this.imagesLoaded++;
        })
        .catch(() => {
          // Even preloading failed, mark as loaded to prevent infinite loading
          firstVehicle.imageLoaded = true;
          this.imagesLoaded++;
        });
    }
  }

  private preloadCriticalImages(): void {
    // Preload the first vehicle image (above the fold)
    if (this.featuredVehicles.length > 0) {
      const firstVehicle = this.featuredVehicles[0];
      this.preloadImage(firstVehicle.image)
        .then(() => {
          firstVehicle.imageLoaded = true;
          this.imagesLoaded++;
        })
        .catch(() => {
          // Mark as loaded even if preloading fails
          firstVehicle.imageLoaded = true;
          this.imagesLoaded++;
        });
    }
  }

  private preloadImage(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.isBrowser) {
        resolve();
        return;
      }

      const img = new Image();
      img.onload = () => resolve();
      img.onerror = () => reject();
      img.src = src;
    });
  }

  onImageLoad(vehicle: Vehicle): void {
    vehicle.imageLoaded = true;
    this.imagesLoaded++;
  }

  onImageError(vehicle: Vehicle, event: any): void {
    // Fallback to placeholder or default image
    event.target.src = vehicle.imagePlaceholder || 'assets/default-car.jpg';
    vehicle.imageLoaded = true;
    this.imagesLoaded++;
  }

  // Lazy loading intersection observer
  onImageIntersection(vehicle: Vehicle, isIntersecting: boolean): void {
    if (!this.isBrowser) {
      // For SSR, mark image as loaded immediately
      vehicle.imageLoaded = true;
      this.imagesLoaded++;
      return;
    }

    if (isIntersecting && !vehicle.imageLoaded) {
      // Start loading the actual image
      const img = new Image();
      img.onload = () => this.onImageLoad(vehicle);
      img.onerror = (event) => this.onImageError(vehicle, event);
      
      // Load the regular image
      img.src = vehicle.image;
    }
  }

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  trackByVehicleId(index: number, vehicle: Vehicle): number {
    return vehicle.id;
  }

  toggleLike(vehicle: Vehicle): void {
    vehicle.isLiked = !vehicle.isLiked;
    // Here you would typically call a service to update the like status
  }
}
