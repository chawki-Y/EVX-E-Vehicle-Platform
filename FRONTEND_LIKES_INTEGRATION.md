# Frontend Likes Integration Guide

This guide explains how to integrate the backend like functionality into your Angular frontend components.

## 🔧 Updated Services

### LikesService

The `LikesService` has been updated to integrate with the backend API while maintaining backward compatibility with localStorage.

#### Key Features:
- **Backend Integration**: All like operations sync with the backend API
- **Fallback Support**: Falls back to localStorage if backend is unavailable
- **Real-time Updates**: Uses RxJS observables for reactive updates
- **User Management**: Supports multiple users with `setUserId()`

#### Available Methods:

```typescript
// Backend API Methods
getUserLikesFromBackend(page?: number, limit?: number): Observable<UserLikesResponse>
toggleLikeOnBackend(vehicleId: number): Observable<LikeToggleResponse>
checkLikeStatus(vehicleId: number): Observable<LikeCheckResponse>
checkMultipleLikeStatus(vehicleIds: number[]): Observable<{[key: number]: boolean}>

// Updated Methods with Backend Integration
toggleLike(vehicle: any): Observable<boolean>  // Now returns Observable
addToLikes(vehicle: any): void
removeFromLikes(vehicleId: number): void

// Utility Methods
setUserId(userId: number): void
getLikedItems(): LikedItem[]
getLikesCount(): number
isLiked(vehicleId: number): boolean

// Legacy Methods (for backward compatibility)
toggleLikeSync(vehicle: any): boolean
```

### VehicleService

The `VehicleService` has been updated to include `userId` parameter for fetching vehicles with like status.

#### Updated Methods:

```typescript
getVehicles(filters?, sortBy?, page?, limit?, userId?): Observable<VehicleResponse>
getHeroVehicles(userId?): Observable<Vehicle[]>
getFeaturedVehicles(userId?): Observable<Vehicle[]>
getVehicleById(id: number, userId?): Observable<Vehicle>
```

## 🚀 Component Integration Examples

### 1. Vehicle List Component

```typescript
import { Component, OnInit } from '@angular/core';
import { VehicleService, LikesService } from '../services';

@Component({
  selector: 'app-vehicle-list',
  template: `
    <div class="vehicle-grid">
      <div *ngFor="let vehicle of vehicles" class="vehicle-card">
        <h3>{{ vehicle.name }}</h3>
        <p>{{ vehicle.brand }} - ${{ vehicle.price }}</p>
        
        <!-- Like Button -->
        <button 
          class="like-btn"
          [class.liked]="vehicle.isLiked"
          (click)="toggleLike(vehicle)"
          [disabled]="isToggling">
          <i class="heart-icon"></i>
          {{ vehicle.isLiked ? 'Liked' : 'Like' }}
        </button>
      </div>
    </div>
  `
})
export class VehicleListComponent implements OnInit {
  vehicles: Vehicle[] = [];
  isToggling = false;
  currentUserId = 1; // Get from auth service

  constructor(
    private vehicleService: VehicleService,
    private likesService: LikesService
  ) {}

  ngOnInit() {
    // Set user ID for likes service
    this.likesService.setUserId(this.currentUserId);
    
    // Load vehicles with like status
    this.loadVehicles();
  }

  loadVehicles() {
    this.vehicleService.getVehicles({}, 'name_asc', 1, 12, this.currentUserId)
      .subscribe({
        next: (response) => {
          this.vehicles = response.data;
        },
        error: (error) => {
          console.error('Error loading vehicles:', error);
        }
      });
  }

  toggleLike(vehicle: Vehicle) {
    this.isToggling = true;
    
    this.likesService.toggleLike(vehicle).subscribe({
      next: (isLiked) => {
        vehicle.isLiked = isLiked;
        this.isToggling = false;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        this.isToggling = false;
      }
    });
  }
}
```

### 2. Vehicle Detail Component

```typescript
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { VehicleService, LikesService } from '../services';

@Component({
  selector: 'app-vehicle-detail',
  template: `
    <div *ngIf="vehicle" class="vehicle-detail">
      <h1>{{ vehicle.name }}</h1>
      <img [src]="vehicle.image" [alt]="vehicle.name">
      
      <div class="actions">
        <button 
          class="like-btn"
          [class.liked]="vehicle.isLiked"
          (click)="toggleLike()"
          [disabled]="isToggling">
          <i class="heart-icon"></i>
          {{ vehicle.isLiked ? 'Remove from Favorites' : 'Add to Favorites' }}
        </button>
      </div>
      
      <!-- Vehicle details -->
      <div class="details">
        <p><strong>Brand:</strong> {{ vehicle.brand }}</p>
        <p><strong>Price:</strong> ${{ vehicle.price }}</p>
        <p><strong>Range:</strong> {{ vehicle.range }} miles</p>
        <!-- More details -->
      </div>
    </div>
  `
})
export class VehicleDetailComponent implements OnInit {
  vehicle: Vehicle | null = null;
  isToggling = false;
  currentUserId = 1; // Get from auth service

  constructor(
    private route: ActivatedRoute,
    private vehicleService: VehicleService,
    private likesService: LikesService
  ) {}

  ngOnInit() {
    this.likesService.setUserId(this.currentUserId);
    
    const vehicleId = Number(this.route.snapshot.paramMap.get('id'));
    this.loadVehicle(vehicleId);
  }

  loadVehicle(id: number) {
    this.vehicleService.getVehicleById(id, this.currentUserId)
      .subscribe({
        next: (vehicle) => {
          this.vehicle = vehicle;
        },
        error: (error) => {
          console.error('Error loading vehicle:', error);
        }
      });
  }

  toggleLike() {
    if (!this.vehicle) return;
    
    this.isToggling = true;
    
    this.likesService.toggleLike(this.vehicle).subscribe({
      next: (isLiked) => {
        if (this.vehicle) {
          this.vehicle.isLiked = isLiked;
        }
        this.isToggling = false;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
        this.isToggling = false;
      }
    });
  }
}
```

### 3. Liked Vehicles Page

```typescript
import { Component, OnInit } from '@angular/core';
import { LikesService } from '../services';

@Component({
  selector: 'app-liked-vehicles',
  template: `
    <div class="liked-vehicles-page">
      <h1>My Favorite Vehicles</h1>
      
      <div *ngIf="loading" class="loading">Loading...</div>
      
      <div *ngIf="!loading && likedVehicles.length === 0" class="empty-state">
        <p>You haven't liked any vehicles yet.</p>
        <a routerLink="/vehicles" class="btn btn-primary">Browse Vehicles</a>
      </div>
      
      <div *ngIf="!loading && likedVehicles.length > 0" class="vehicles-grid">
        <div *ngFor="let vehicle of likedVehicles" class="vehicle-card">
          <img [src]="vehicle.image" [alt]="vehicle.name">
          <h3>{{ vehicle.name }}</h3>
          <p>{{ vehicle.brand }} - ${{ vehicle.price }}</p>
          <p class="liked-date">Liked on {{ vehicle.dateAdded | date:'short' }}</p>
          
          <div class="actions">
            <button 
              class="btn btn-outline"
              (click)="removeLike(vehicle.id)">
              Remove from Favorites
            </button>
            <a [routerLink]="['/vehicles', vehicle.id]" class="btn btn-primary">
              View Details
            </a>
          </div>
        </div>
      </div>
      
      <!-- Pagination -->
      <div *ngIf="pagination.pages > 1" class="pagination">
        <button 
          *ngFor="let page of getPaginationPages()" 
          [class.active]="page === pagination.page"
          (click)="loadPage(page)">
          {{ page }}
        </button>
      </div>
    </div>
  `
})
export class LikedVehiclesComponent implements OnInit {
  likedVehicles: any[] = [];
  loading = false;
  pagination = { page: 1, limit: 12, total: 0, pages: 0 };
  currentUserId = 1; // Get from auth service

  constructor(private likesService: LikesService) {}

  ngOnInit() {
    this.likesService.setUserId(this.currentUserId);
    this.loadLikedVehicles();
  }

  loadLikedVehicles(page: number = 1) {
    this.loading = true;
    
    this.likesService.getUserLikesFromBackend(page, this.pagination.limit)
      .subscribe({
        next: (response) => {
          this.likedVehicles = response.vehicles;
          this.pagination = response.pagination;
          this.loading = false;
        },
        error: (error) => {
          console.error('Error loading liked vehicles:', error);
          // Fallback to local storage
          this.likedVehicles = this.likesService.getLikedItems();
          this.loading = false;
        }
      });
  }

  removeLike(vehicleId: number) {
    this.likesService.removeFromLikes(vehicleId);
    // Reload the list
    this.loadLikedVehicles(this.pagination.page);
  }

  loadPage(page: number) {
    this.loadLikedVehicles(page);
  }

  getPaginationPages(): number[] {
    const pages = [];
    for (let i = 1; i <= this.pagination.pages; i++) {
      pages.push(i);
    }
    return pages;
  }
}
```

### 4. Hero Section Component

```typescript
import { Component, OnInit } from '@angular/core';
import { VehicleService, LikesService } from '../services';

@Component({
  selector: 'app-hero-section',
  template: `
    <div class="hero-section">
      <div class="hero-slider">
        <div *ngFor="let vehicle of heroVehicles" class="hero-slide">
          <img [src]="vehicle.image" [alt]="vehicle.name">
          <div class="hero-content">
            <h2>{{ vehicle.name }}</h2>
            <p>{{ vehicle.brand }} - Starting at ${{ vehicle.price }}</p>
            
            <div class="hero-actions">
              <button 
                class="like-btn"
                [class.liked]="vehicle.isLiked"
                (click)="toggleLike(vehicle)">
                <i class="heart-icon"></i>
              </button>
              <a [routerLink]="['/vehicles', vehicle.id]" class="btn btn-primary">
                Learn More
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class HeroSectionComponent implements OnInit {
  heroVehicles: Vehicle[] = [];
  currentUserId = 1; // Get from auth service

  constructor(
    private vehicleService: VehicleService,
    private likesService: LikesService
  ) {}

  ngOnInit() {
    this.likesService.setUserId(this.currentUserId);
    this.loadHeroVehicles();
  }

  loadHeroVehicles() {
    this.vehicleService.getHeroVehicles(this.currentUserId)
      .subscribe({
        next: (vehicles) => {
          this.heroVehicles = vehicles;
        },
        error: (error) => {
          console.error('Error loading hero vehicles:', error);
        }
      });
  }

  toggleLike(vehicle: Vehicle) {
    this.likesService.toggleLike(vehicle).subscribe({
      next: (isLiked) => {
        vehicle.isLiked = isLiked;
      },
      error: (error) => {
        console.error('Error toggling like:', error);
      }
    });
  }
}
```

## 🎨 CSS Styling

Add these styles for the like buttons:

```css
.like-btn {
  background: none;
  border: 2px solid #ddd;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.like-btn:hover {
  border-color: #ff4757;
  transform: scale(1.1);
}

.like-btn.liked {
  background: #ff4757;
  border-color: #ff4757;
  color: white;
}

.like-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.heart-icon::before {
  content: '♡';
  font-size: 18px;
}

.like-btn.liked .heart-icon::before {
  content: '♥';
}
```

## 🔧 Configuration

### Environment Configuration

Make sure your environment files include the backend URL:

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://168.231.106.100:3001/api'
};

// src/environments/environment.prod.ts
export const environment = {
  production: true,
  apiUrl: 'https://your-production-api.com/api'
};
```

### Update Services to Use Environment

```typescript
// In both VehicleService and LikesService
import { environment } from '../../environments/environment';

// Replace hardcoded URL with:
private readonly baseUrl = environment.apiUrl;
```

## 🚀 Getting Started

1. **Update your components** to use the new service methods
2. **Add userId parameter** when calling vehicle service methods
3. **Handle Observable responses** from the new `toggleLike()` method
4. **Set user ID** using `likesService.setUserId()` when user logs in
5. **Add error handling** for backend failures

## 📝 Migration Notes

- The `toggleLike()` method now returns an `Observable<boolean>` instead of `boolean`
- Use `toggleLikeSync()` for the old synchronous behavior (not recommended)
- All vehicle service methods now accept an optional `userId` parameter
- Like status is automatically included when `userId` is provided

## 🔍 Testing

To test the integration:

1. Start your backend server: `npm start` (in the `be` directory)
2. Start your Angular app: `ng serve`
3. Open browser and test like functionality
4. Check browser network tab to see API calls
5. Verify data persistence by refreshing the page

The system will gracefully fall back to localStorage if the backend is unavailable, ensuring your app continues to work even during backend maintenance.
