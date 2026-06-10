import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { VehicleService, Vehicle, Accessory, DisplayItem } from '../../services/vehicle.service';
import { CartService } from '../../services/cart.service';
import { LikesService } from '../../services/likes.service';
import { FooterComponent } from '../../components/footer/footer.component';
import { OptimizedImageComponent } from '../../components/optimized-image/optimized-image.component';

@Component({
  selector: 'app-product-info',
  standalone: true,
  imports: [CommonModule, FooterComponent, OptimizedImageComponent],
  templateUrl: './product-info.component.html',
  styleUrl: './product-info.component.css'
})
export class ProductInfoComponent implements OnInit, OnDestroy {
  product: DisplayItem | null = null;
  productType: 'vehicle' | 'accessory' = 'vehicle';
  loading = true;
  error: string | null = null;
  currentImageIndex = 0;
  otherProducts: DisplayItem[] = [];
  loadingOtherProducts = false;
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private vehicleService: VehicleService,
    private cartService: CartService,
    private likesService: LikesService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.route.params.pipe(takeUntil(this.destroy$)).subscribe(params => {
      // Handle different route patterns:
      // /product/:type/:id - has both type and id
      // /vehicle - no parameters, defaults to vehicle type
      // /accessory/:id - has id, type is accessory
      let id: string | number;
      let type: 'vehicle' | 'accessory';
      console.log('Route params:', params);

      if (params['id']) {
        // For vehicles, try to parse as number, for accessories keep as string
        const paramId = params['id'];
        if (params['type'] === 'vehicle' && !isNaN(parseInt(paramId, 10))) {
          id = parseInt(paramId, 10);
        } else {
          id = paramId; // Keep as string for accessories (UUIDs)
        }
      } else {
        id = 2; // Default ID when no ID is provided
      }

      if (params['type']) {
        type = params['type'] as 'vehicle' | 'accessory';
      } else {
        // Determine type based on current route
        const currentUrl = this.router.url;
        if (currentUrl.includes('/accessory')) {
          type = 'accessory';
        } else {
          type = 'vehicle'; // Default to vehicle
        }
      }

      this.productType = type;
      
      // Only load product data in browser environment to prevent SSR issues
      if (isPlatformBrowser(this.platformId)) {
        this.loadProduct(id);
      } else {
        // Set loading to false for SSR to prevent infinite loading state
        this.loading = false;
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(id: string | number): void {
    this.loading = true;
    this.error = null;

    if (this.productType === 'vehicle') {
      this.vehicleService.getVehicleById(id as number).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (vehicle) => {
          this.product = { ...vehicle, type: 'vehicle' as const };
          this.loading = false;
          this.loadOtherProducts();
        },
        error: (error) => {
          console.error('Error loading vehicle:', error);
          this.error = 'Failed to load vehicle information';
          this.loading = false;
        }
      });
    } else {
      this.vehicleService.getAccessoryById(id as string).pipe(
        takeUntil(this.destroy$)
      ).subscribe({
        next: (accessory) => {
          this.product = { ...accessory, type: 'accessory' as const };
          this.loading = false;
          this.loadOtherProducts();
        },
        error: (error) => {
          console.error('Error loading accessory:', error);
          this.error = 'Failed to load accessory information';
          this.loading = false;
        }
      });
    }
  }

  onAddToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product.id);
      // Show success message or notification
    }
  }

  onBookTestDrive(): void {
    if (this.product && this.isVehicle()) {
      // TODO: Implement test drive booking functionality
      // This could open a modal, navigate to a booking page, or show a form
      console.log('Booking test drive for:', this.product.name);
      alert(`Test drive booking for ${this.product.name} - Feature coming soon!`);
    }
  }

  onToggleLike(): void {
    if (this.product) {
      if (this.productType === 'vehicle') {
        this.likesService.toggleLike(this.product).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (isLiked: boolean) => {
            if (this.product) {
              this.product.isLiked = isLiked;
            }
          },
          error: (error: any) => {
            console.error('Error toggling like:', error);
          }
        });
      }
      // For accessories, we might implement likes later
    }
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  goBack(): void {
    this.router.navigate(['/advanced-search']);
  }

  isVehicle(): boolean {
    return this.product?.type === 'vehicle' || this.productType === 'vehicle';
  }

  isAccessory(): boolean {
    return this.product?.type === 'accessory' || this.productType === 'accessory';
  }

  getVehicle(): Vehicle | null {
    return this.isVehicle() ? this.product as Vehicle : null;
  }

  getAccessory(): Accessory | null {
    return this.isAccessory() ? this.product as Accessory : null;
  }

  // Image gallery methods
  getProductImages(): string[] {
    if (!this.product) return [];

    // Check if product has multiple images, otherwise use single image
    const images = (this.product as any).images;
    if (images && Array.isArray(images) && images.length > 0) {
      return images;
    }

    // Fallback to single image
    return [this.product.image];
  }

  getCurrentImage(): string {
    const images = this.getProductImages();
    if (images.length === 0) return '';

    // Ensure currentImageIndex is within bounds
    if (this.currentImageIndex >= images.length) {
      this.currentImageIndex = 0;
    }

    return images[this.currentImageIndex];
  }

  nextImage(): void {
    const images = this.getProductImages();
    if (images.length <= 1) return;

    this.currentImageIndex = (this.currentImageIndex + 1) % images.length;
  }

  previousImage(): void {
    const images = this.getProductImages();
    if (images.length <= 1) return;

    this.currentImageIndex = this.currentImageIndex === 0
      ? images.length - 1
      : this.currentImageIndex - 1;
  }

  selectImage(index: number): void {
    const images = this.getProductImages();
    if (index >= 0 && index < images.length) {
      this.currentImageIndex = index;
    }
  }

  private loadOtherProducts(): void {
    if (!this.product?.dealer?.name) return;

    this.loadingOtherProducts = true;
    const dealerName = this.product.dealer.name;
    const currentProductId = this.product.id;

    // Get both vehicles and accessories from the same dealer
    const vehicleFilters = { dealers: [dealerName] };
    const accessoryFilters = { dealers: [dealerName] };

    // Load vehicles
    this.vehicleService.getVehicles(vehicleFilters, 'name_asc', 1, 6).pipe(
      takeUntil(this.destroy$)
    ).subscribe({
      next: (vehicleResponse) => {
        const otherVehicles = vehicleResponse.data
          .filter(vehicle => vehicle.id !== currentProductId)
          .map(vehicle => ({ ...vehicle, type: 'vehicle' as const }));

        // Load accessories
        this.vehicleService.getAccessories(accessoryFilters, 'name_asc', 1, 6).pipe(
          takeUntil(this.destroy$)
        ).subscribe({
          next: (accessoryResponse) => {
            const otherAccessories = accessoryResponse.data
              .filter(accessory => accessory.id !== currentProductId)
              .map(accessory => ({ ...accessory, type: 'accessory' as const }));

            // Combine and limit to 4 products
            this.otherProducts = [...otherVehicles, ...otherAccessories].slice(0, 4);
            this.loadingOtherProducts = false;
          },
          error: (error) => {
            console.error('Error loading accessories:', error);
            this.otherProducts = otherVehicles.slice(0, 4);
            this.loadingOtherProducts = false;
          }
        });
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.loadingOtherProducts = false;
      }
    });
  }

  onViewProduct(product: DisplayItem): void {
    const productType = product.type === 'vehicle' ? 'vehicle' : 'accessory';
    this.router.navigate(['/product', productType, product.id]);
  }
}