import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, BehaviorSubject, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Dealer {
  name: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  verified: boolean;
}

export interface Vehicle {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string; // Primary image for backward compatibility
  images?: string[]; // Multiple images array
  range: number;
  year: number;
  condition: 'new' | 'used';
  category: string;
  rating: number;
  reviews: number;
  isLiked: boolean;
  isCompared: boolean;
  isElectric?: boolean;
  badge?: string;
  features: string[];
  batterySize: string;
  chargingTime: string;
  dealer: Dealer;
  description?: string;
}

export interface Accessory {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string; // Primary image for backward compatibility
  images?: string[]; // Multiple images array
  category: string;
  rating: number;
  reviews: number;
  isLiked?: boolean;
  isCompared: boolean;
  badge?: string;
  features: string[];
  compatibility: string[];
  dealer: Dealer;
  type: 'accessory';
  description?: string;
}

export interface ExtendedVehicle extends Vehicle {
  type: 'vehicle';
}

export type DisplayItem = ExtendedVehicle | Accessory;

export interface VehicleFilters {
  priceMin?: number;
  priceMax?: number;
  rangeMin?: number;
  rangeMax?: number;
  conditions?: string[];
  categories?: string[];
  brands?: string[];
  dealers?: string[];
  yearMin?: number;
  yearMax?: number;
  search?: string;
  isElectric?: boolean;
}

export interface ItemFilters extends VehicleFilters {
  types?: string[]; // ['vehicles', 'accessories']
}

// Separate filter interfaces for vehicles and accessories
export interface VehicleSpecificFilters {
  range?: [number, number];
  batterySize?: string[];
  chargingTime?: [number, number];
  isElectric?: boolean;
  year?: [number, number];
}

export interface AccessorySpecificFilters {
  compatibility?: string[];
  installationType?: string[]; // 'professional', 'diy'
  warranty?: string[];
  material?: string[];
}

export interface SortOption {
  value: string;
  label: string;
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface VehicleResponse {
  success: boolean;
  data: Vehicle[];
  pagination: PaginationInfo;
  filters: VehicleFilters;
  sortBy: string;
}

export interface AccessoryResponse {
  success: boolean;
  data: Accessory[];
  pagination: PaginationInfo;
  filters: ItemFilters;
  sortBy: string;
}

export interface ItemResponse {
  success: boolean;
  data: DisplayItem[];
  pagination: PaginationInfo;
  filters: ItemFilters;
  sortBy: string;
}

export interface VehicleStats {
  totalVehicles: number;
  averagePrice: number;
  averageRange: number;
  averageRating: number;
  priceRange: { min: number; max: number };
  rangeSpan: { min: number; max: number };
  yearRange: { min: number; max: number };
  conditionCounts: { new: number; used: number };
  categoryCounts: { [key: string]: number };
  brandCounts: { [key: string]: number };
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private readonly baseUrl = environment.apiUrl;
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();

  constructor(private http: HttpClient) {}

  /**
   * Get vehicles with filtering, sorting, and pagination
   */
  getVehicles(
    filters: VehicleFilters = {},
    sortBy: string = 'name_asc',
    page: number = 1,
    limit: number = 12,
    userId?: number
  ): Observable<VehicleResponse> {
    this.setLoading(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    // Add filters to params
    if (filters.priceMin !== undefined) {
      params = params.set('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax !== undefined) {
      params = params.set('priceMax', filters.priceMax.toString());
    }
    if (filters.rangeMin !== undefined) {
      params = params.set('rangeMin', filters.rangeMin.toString());
    }
    if (filters.rangeMax !== undefined) {
      params = params.set('rangeMax', filters.rangeMax.toString());
    }
    if (filters.conditions && filters.conditions.length > 0) {
      params = params.set('conditions', filters.conditions.join(','));
    }
    if (filters.categories && filters.categories.length > 0) {
      params = params.set('categories', filters.categories.join(','));
    }
    if (filters.brands && filters.brands.length > 0) {
      params = params.set('brands', filters.brands.join(','));
    }
    if (filters.dealers && filters.dealers.length > 0) {
      params = params.set('dealers', filters.dealers.join(','));
    }

    if (filters.yearMin !== undefined) {
      params = params.set('yearMin', filters.yearMin.toString());
    }
    if (filters.yearMax !== undefined) {
      params = params.set('yearMax', filters.yearMax.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.isElectric !== undefined) {
      params = params.set('isElectric', filters.isElectric.toString());
    }
    if (userId !== undefined) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<VehicleResponse>(`${this.baseUrl}/vehicles`, { params })
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.setLoading(false);
          console.error('Error fetching vehicles:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get hero vehicles for the slideshow
   */
  getHeroVehicles(userId?: number): Observable<Vehicle[]> {
    let params = new HttpParams();
    if (userId !== undefined) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<{ success: boolean; data: Vehicle[] }>(`${this.baseUrl}/vehicles/hero`, { params })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching hero vehicles:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get featured vehicles
   */
  getFeaturedVehicles(userId?: number): Observable<Vehicle[]> {
    let params = new HttpParams();
    if (userId !== undefined) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<{ success: boolean; data: Vehicle[] }>(`${this.baseUrl}/vehicles/featured`, { params })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching featured vehicles:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get a single vehicle by ID
   */
  getVehicleById(id: number, userId?: number): Observable<Vehicle> {
    let params = new HttpParams();
    if (userId !== undefined) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<{ success: boolean; data: Vehicle }>(`${this.baseUrl}/vehicles/${id}`, { params })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching vehicle:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get accessory by ID
   */
  getAccessoryById(id: string, userId?: number): Observable<Accessory> {
    let params = new HttpParams();
    if (userId !== undefined) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<{ success: boolean; data: Accessory }>(`${this.baseUrl}/accessories/${id}`, { params })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching accessory:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get search suggestions
   */
  getSearchSuggestions(query: string): Observable<string[]> {
    if (!query || query.length < 2) {
      return new Observable(observer => {
        observer.next([]);
        observer.complete();
      });
    }

    const params = new HttpParams().set('q', query);
    return this.http.get<{ success: boolean; data: string[] }>(`${this.baseUrl}/vehicles/search/suggestions`, { params })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching suggestions:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get vehicle statistics
   */
  getVehicleStats(): Observable<VehicleStats> {
    return this.http.get<{ success: boolean; data: VehicleStats }>(`${this.baseUrl}/vehicles/stats/summary`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching vehicle stats:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get available categories
   */
  getCategories(): Observable<string[]> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.baseUrl}/categories`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching categories:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get available brands
   */
  getBrands(): Observable<string[]> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.baseUrl}/categories/brands`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching brands:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get all filter options
   */
  getFilterOptions(): Observable<{
    categories: string[];
    brands: string[];
    dealers: string[];
    conditions: string[];
    sortOptions: SortOption[];
  }> {
    return this.http.get<any>(`${this.baseUrl}/categories/filters`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching filter options:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get all dealers from both vehicles and accessories
   */
  getDealers(): Observable<string[]> {
    return this.http.get<any>(`${this.baseUrl}/dealers`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching dealers:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get dealers from vehicles only
   */
  getVehicleDealers(): Observable<string[]> {
    return this.http.get<any>(`${this.baseUrl}/dealers/vehicles`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching vehicle dealers:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get dealers from accessories only
   */
  getAccessoryDealers(): Observable<string[]> {
    return this.http.get<any>(`${this.baseUrl}/dealers/accessories`)
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching accessory dealers:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Check if backend is healthy
   */
  checkHealth(): Observable<any> {
    return this.http.get(`${this.baseUrl}/health`)
      .pipe(
        catchError(error => {
          console.error('Backend health check failed:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get accessories with filtering, sorting, and pagination
   */
  getAccessories(
    filters: ItemFilters = {},
    sortBy: string = 'name_asc',
    page: number = 1,
    limit: number = 12,
    userId?: number
  ): Observable<AccessoryResponse> {
    this.setLoading(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    // Add filters to params
    if (filters.priceMin !== undefined) {
      params = params.set('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax !== undefined) {
      params = params.set('priceMax', filters.priceMax.toString());
    }
    if (filters.categories && filters.categories.length > 0) {
      params = params.set('categories', filters.categories.join(','));
    }
    if (filters.brands && filters.brands.length > 0) {
      params = params.set('brands', filters.brands.join(','));
    }
    if (filters.dealers && filters.dealers.length > 0) {
      params = params.set('dealers', filters.dealers.join(','));
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (userId !== undefined) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<AccessoryResponse>(`${this.baseUrl}/accessories`, { params })
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.setLoading(false);
          console.error('Error fetching accessories:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get combined items (vehicles and accessories) with filtering, sorting, and pagination
   */
  getItems(
    filters: ItemFilters = {},
    sortBy: string = 'name_asc',
    page: number = 1,
    limit: number = 12,
    userId?: number
  ): Observable<ItemResponse> {
    this.setLoading(true);

    let params = new HttpParams()
      .set('page', page.toString())
      .set('limit', limit.toString())
      .set('sortBy', sortBy);

    // Add filters to params
    if (filters.types && filters.types.length > 0) {
      params = params.set('types', filters.types.join(','));
    }
    if (filters.priceMin !== undefined) {
      params = params.set('priceMin', filters.priceMin.toString());
    }
    if (filters.priceMax !== undefined) {
      params = params.set('priceMax', filters.priceMax.toString());
    }
    if (filters.rangeMin !== undefined) {
      params = params.set('rangeMin', filters.rangeMin.toString());
    }
    if (filters.rangeMax !== undefined) {
      params = params.set('rangeMax', filters.rangeMax.toString());
    }
    if (filters.conditions && filters.conditions.length > 0) {
      params = params.set('conditions', filters.conditions.join(','));
    }
    if (filters.categories && filters.categories.length > 0) {
      params = params.set('categories', filters.categories.join(','));
    }
    if (filters.brands && filters.brands.length > 0) {
      params = params.set('brands', filters.brands.join(','));
    }
    if (filters.dealers && filters.dealers.length > 0) {
      params = params.set('dealers', filters.dealers.join(','));
    }
    if (filters.yearMin !== undefined) {
      params = params.set('yearMin', filters.yearMin.toString());
    }
    if (filters.yearMax !== undefined) {
      params = params.set('yearMax', filters.yearMax.toString());
    }
    if (filters.search) {
      params = params.set('search', filters.search);
    }
    if (filters.isElectric !== undefined) {
      params = params.set('isElectric', filters.isElectric.toString());
    }
    if (userId !== undefined) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<ItemResponse>(`${this.baseUrl}/items`, { params })
      .pipe(
        map(response => {
          this.setLoading(false);
          return response;
        }),
        catchError(error => {
          this.setLoading(false);
          console.error('Error fetching items:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get featured accessories
   */
  getFeaturedAccessories(userId?: number): Observable<Accessory[]> {
    let params = new HttpParams();
    if (userId !== undefined) {
      params = params.set('userId', userId.toString());
    }

    return this.http.get<{ success: boolean; data: Accessory[] }>(`${this.baseUrl}/accessories/featured`, { params })
      .pipe(
        map(response => response.data),
        catchError(error => {
          console.error('Error fetching featured accessories:', error);
          return throwError(() => error);
        })
      );
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }
}
