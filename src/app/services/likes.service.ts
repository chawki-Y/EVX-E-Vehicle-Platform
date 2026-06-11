import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { isPlatformBrowser } from '@angular/common';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { UserContextService } from './user-context.service';

interface LikedItem {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  image: string;
  range?: number;
  year?: number;
  condition?: 'new' | 'used';
  category: string;
  rating: number;
  reviews?: number;
  dateAdded: Date;
  likedAt?: string;
  type: 'vehicle' | 'accessory';
}

interface LikeToggleResponse {
  success: boolean;
  isLiked: boolean;
  message: string;
}

interface LikeCheckResponse {
  isLiked: boolean;
}

interface UserLikesResponse {
  items: LikedItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class LikesService {
  private readonly baseUrl = environment.apiUrl;
  private likedItems: LikedItem[] = [];
  private likesSubject = new BehaviorSubject<LikedItem[]>([]);
  public likes$ = this.likesSubject.asObservable();
  private currentUserId: number;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private http: HttpClient,
    private userContext: UserContextService
  ) {
    this.currentUserId = this.userContext.getUserId();
    this.loadLikesFromStorage();
    // Only sync with backend in browser environment - do this asynchronously to prevent blocking
    if (isPlatformBrowser(this.platformId)) {
      // Use setTimeout to ensure this doesn't block the constructor
      setTimeout(() => this.syncWithBackend(), 0);
    }
  }

  /**
   * Set the current user ID (should be called when user logs in)
   */
  setUserId(userId: number): void {
    this.currentUserId = userId;
    this.syncWithBackend();
  }

  getUserId(): number {
    return this.currentUserId;
  }

  /**
   * Sync likes with backend on service initialization
   */
  private syncWithBackend(): void {
    this.getUserLikesFromBackend().subscribe({
      next: (response) => {
        this.likedItems = response.items.map(item => ({
          ...item,
          dateAdded: item.likedAt ? new Date(item.likedAt) : new Date()
        }));
        this.likesSubject.next(this.likedItems);
        this.saveLikesToStorage();
      },
      error: (error) => {
        console.warn('Could not sync likes with backend, using local storage:', error);
      }
    });
  }

  private loadLikesFromStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      const storageKey = this.getStorageKey();
      const savedLikes = localStorage.getItem(storageKey) || localStorage.getItem('likes');
      if (savedLikes) {
        this.likedItems = JSON.parse(savedLikes).map((item: any) => ({
          ...item,
          dateAdded: new Date(item.dateAdded)
        }));
        localStorage.setItem(storageKey, JSON.stringify(this.likedItems));
        localStorage.removeItem('likes');
        this.likesSubject.next(this.likedItems);
      }
    }
  }

  private saveLikesToStorage(): void {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(this.getStorageKey(), JSON.stringify(this.likedItems));
    }
    this.likesSubject.next(this.likedItems);
  }

  private getStorageKey(): string {
    return `likes:${this.currentUserId}`;
  }

  /**
   * Backend API Methods
   */

  /**
   * Get user's liked items from backend (both vehicles and accessories)
   */
  getUserLikesFromBackend(page: number = 1, limit: number = 50, type?: 'vehicle' | 'accessory'): Observable<UserLikesResponse> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString());

    if (type) {
      params = params.set('type', type);
    }

    return this.http.get<UserLikesResponse>(`${this.baseUrl}/item-likes/user/${this.currentUserId}`, { params })
      .pipe(
        catchError(error => {
          console.error('Error fetching user likes:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Toggle like status for an item (vehicle or accessory) on backend
   */
  toggleLikeOnBackend(itemId: number | string, itemType: 'vehicle' | 'accessory'): Observable<LikeToggleResponse> {
    const body = {
      userId: this.currentUserId,
      itemId: itemId,
      itemType: itemType
    };

    return this.http.post<LikeToggleResponse>(`${this.baseUrl}/item-likes/toggle`, body)
      .pipe(
        catchError(error => {
          console.error('Error toggling like:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if user likes a specific item
   */
  checkLikeStatus(itemId: number | string, itemType: 'vehicle' | 'accessory'): Observable<LikeCheckResponse> {
    return this.http.get<LikeCheckResponse>(`${this.baseUrl}/item-likes/check/${this.currentUserId}/${itemType}/${itemId}`)
      .pipe(
        catchError(error => {
          console.error('Error checking like status:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Check like status for multiple items
   */
  checkMultipleLikeStatus(items: {id: number | string, type: 'vehicle' | 'accessory'}[]): Observable<{[key: string]: boolean}> {
    const body = {
      userId: this.currentUserId,
      items: items
    };

    return this.http.post<{[key: string]: boolean}>(`${this.baseUrl}/item-likes/check-multiple`, body)
      .pipe(
        catchError(error => {
          console.error('Error checking multiple like status:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Updated Local Methods with Backend Integration
   */

  addToLikes(item: any): void {
    const existingItem = this.likedItems.find(likedItem => likedItem.id === item.id && likedItem.type === item.type);

    if (!existingItem) {
      const likedItem: LikedItem = {
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating,
        dateAdded: new Date(),
        type: item.type || 'vehicle'
      };

      // Add vehicle-specific properties if it's a vehicle
      if (item.type === 'vehicle' || !item.type) {
        likedItem.range = item.range;
        likedItem.year = item.year;
        likedItem.condition = item.condition;
        likedItem.reviews = item.reviews;
      }

      // Use backend for both vehicles and accessories
      const itemType = item.type || 'vehicle';
      this.toggleLikeOnBackend(item.id, itemType).subscribe({
        next: (response) => {
          if (response.isLiked) {
            this.likedItems.push(likedItem);
            this.saveLikesToStorage();
          }
        },
        error: (error) => {
          console.warn('Backend like failed, using local storage:', error);
          this.likedItems.push(likedItem);
          this.saveLikesToStorage();
        }
      });
    }
  }

  removeFromLikes(itemId: number | string, itemType: 'vehicle' | 'accessory' = 'vehicle'): void {
    // Use backend for both vehicles and accessories
    this.toggleLikeOnBackend(itemId, itemType).subscribe({
      next: (response) => {
        if (!response.isLiked) {
          this.likedItems = this.likedItems.filter(item => !(item.id === itemId && item.type === itemType));
          this.saveLikesToStorage();
        }
      },
      error: (error) => {
        console.warn('Backend unlike failed, using local storage:', error);
        this.likedItems = this.likedItems.filter(item => !(item.id === itemId && item.type === itemType));
        this.saveLikesToStorage();
      }
    });
  }

  toggleLike(item: any): Observable<boolean> {
    const itemType = item.type || 'vehicle';
    const isCurrentlyLiked = this.isLiked(item.id, itemType);

    // Use backend for both vehicles and accessories
    return this.toggleLikeOnBackend(item.id, itemType).pipe(
      tap(response => {
        if (response.isLiked) {
          const existingItem = this.likedItems.find(likedItem => likedItem.id === item.id && likedItem.type === itemType);
          if (!existingItem) {
            const likedItem: LikedItem = {
              id: item.id,
              name: item.name,
              brand: item.brand,
              price: item.price,
              image: item.image,
              category: item.category,
              rating: item.rating,
              dateAdded: new Date(),
              type: itemType
            };

            // Add vehicle-specific properties if it's a vehicle
            if (itemType === 'vehicle') {
              likedItem.range = item.range;
              likedItem.year = item.year;
              likedItem.condition = item.condition;
              likedItem.reviews = item.reviews;
            }

            this.likedItems.push(likedItem);
          }
        } else {
          this.likedItems = this.likedItems.filter(likedItem => !(likedItem.id === item.id && likedItem.type === itemType));
        }
        this.saveLikesToStorage();
      }),
      map(response => response.isLiked),
      catchError(error => {
        console.warn('Backend toggle failed, using local storage:', error);
        return this.toggleLikeLocal(item);
      })
    );
  }

  private toggleLikeLocal(item: any): Observable<boolean> {
    const itemType = item.type || 'vehicle';
    const isCurrentlyLiked = this.isLiked(item.id, itemType);

    if (isCurrentlyLiked) {
      this.likedItems = this.likedItems.filter(likedItem => !(likedItem.id === item.id && likedItem.type === itemType));
      this.saveLikesToStorage();
      return new Observable(observer => {
        observer.next(false);
        observer.complete();
      });
    } else {
      const likedItem: LikedItem = {
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image,
        category: item.category,
        rating: item.rating,
        dateAdded: new Date(),
        type: itemType
      };

      // Add vehicle-specific properties if it's a vehicle
      if (itemType === 'vehicle') {
        likedItem.range = item.range;
        likedItem.year = item.year;
        likedItem.condition = item.condition;
        likedItem.reviews = item.reviews;
      }

      this.likedItems.push(likedItem);
      this.saveLikesToStorage();
      return new Observable(observer => {
        observer.next(true);
        observer.complete();
      });
    }
  }

  /**
   * Legacy toggle method for backward compatibility
   */
  toggleLikeSync(item: any): boolean {
    const itemType = item.type || 'vehicle';
    const isLiked = this.isLiked(item.id, itemType);

    if (isLiked) {
      this.removeFromLikes(item.id, itemType);
      return false;
    } else {
      this.addToLikes(item);
      return true;
    }
  }

  getLikedItems(): LikedItem[] {
    return this.likedItems;
  }

  getLikesCount(): number {
    return this.likedItems.length;
  }

  isLiked(itemId: number | string, itemType: 'vehicle' | 'accessory' = 'vehicle'): boolean {
    return this.likedItems.some(item => item.id === itemId && item.type === itemType);
  }

  clearLikes(): void {
    this.likedItems = [];
    this.saveLikesToStorage();
  }

  sortLikesByDate(ascending: boolean = false): LikedItem[] {
    return [...this.likedItems].sort((a, b) => {
      const dateA = new Date(a.dateAdded).getTime();
      const dateB = new Date(b.dateAdded).getTime();
      return ascending ? dateA - dateB : dateB - dateA;
    });
  }

  sortLikesByPrice(ascending: boolean = true): LikedItem[] {
    return [...this.likedItems].sort((a, b) => {
      return ascending ? a.price - b.price : b.price - a.price;
    });
  }

  sortLikesByRating(ascending: boolean = false): LikedItem[] {
    return [...this.likedItems].sort((a, b) => {
      return ascending ? a.rating - b.rating : b.rating - a.rating;
    });
  }
}
