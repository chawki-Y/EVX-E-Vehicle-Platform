/* TypeScript Interfaces for Better Type Safety */

// Common interfaces
export interface ApiResponse<T = any> {
  data: T;
  message: string;
  success: boolean;
  timestamp: string;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Vehicle related interfaces
export interface Vehicle {
  id: string;
  name: string;
  brand: string;
  model: string;
  year: number;
  price: number;
  range: number;
  batteryCapacity: number;
  chargingTime: number;
  images: string[];
  description: string;
  specifications: VehicleSpecifications;
  isLiked?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleSpecifications {
  motor: {
    power: number; // kW
    torque: number; // Nm
    type: string;
  };
  battery: {
    capacity: number; // kWh
    type: string;
    warranty: string;
  };
  performance: {
    acceleration: number; // 0-100 km/h in seconds
    topSpeed: number; // km/h
    range: number; // km
  };
  charging: {
    dcFastCharging: number; // kW
    acCharging: number; // kW
    chargingTime: {
      fast: string; // "10-80% in 30 min"
      standard: string; // "0-100% in 8 hours"
    };
  };
  dimensions: {
    length: number; // mm
    width: number; // mm
    height: number; // mm
    wheelbase: number; // mm
    weight: number; // kg
  };
}

// User related interfaces
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  preferences: UserPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface UserPreferences {
  theme: 'light' | 'dark' | 'auto';
  language: string;
  notifications: {
    email: boolean;
    push: boolean;
    marketing: boolean;
  };
  accessibility: {
    reducedMotion: boolean;
    highContrast: boolean;
    fontSize: 'small' | 'medium' | 'large';
  };
}

// Component props interfaces
export interface LoadingState {
  isLoading: boolean;
  error?: string;
  retryCount?: number;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
}

export interface SearchFilters {
  brand?: string[];
  priceRange?: {
    min: number;
    max: number;
  };
  rangeKm?: {
    min: number;
    max: number;
  };
  year?: {
    min: number;
    max: number;
  };
  bodyType?: string[];
  sortBy?: 'price' | 'range' | 'year' | 'name';
  sortOrder?: 'asc' | 'desc';
}

// Event interfaces
export interface RouteChangeEvent {
  from: string;
  to: string;
  timestamp: number;
}

export interface PerformanceMetric {
  name: string;
  value: number;
  unit: string;
  timestamp: number;
}

// Utility types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// Form interfaces
export interface FormField<T = any> {
  value: T;
  error?: string;
  touched: boolean;
  disabled?: boolean;
  required?: boolean;
}

export interface FormState<T> {
  fields: { [K in keyof T]: FormField<T[K]> };
  isValid: boolean;
  isSubmitting: boolean;
  submitError?: string;
}

// API Error interface
export interface ApiError {
  code: string;
  message: string;
  details?: any;
  timestamp: string;
}