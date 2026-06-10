import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Course {
  id: number;
  title: string;
  description?: string;
  shortDescription?: string;
  image?: string;
  category: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  duration?: string;
  price?: number;
  instructor?: string;
  location?: string;
  maxParticipants?: number;
  currentParticipants: number;
  startDate?: string;
  endDate?: string;
  registrationDeadline?: string;
  syllabus: string[];
  prerequisites: string[];
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  isActive: boolean;
  publishedAt: string;
  sortOrder: number;
}

export interface CourseResponse {
  success: boolean;
  data: Course[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

@Injectable({
  providedIn: 'root'
})
export class CourseService {
  private apiUrl = `${environment.apiUrl}/courses`;

  constructor(private http: HttpClient) {}

  /**
   * Get all courses with optional filtering and pagination
   */
  getCourses(options?: {
    page?: number;
    limit?: number;
    category?: string;
    level?: string;
    featured?: boolean;
    published?: boolean;
    active?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Observable<CourseResponse> {
    let params = new HttpParams();

    if (options) {
      if (options.page) params = params.set('page', options.page.toString());
      if (options.limit) params = params.set('limit', options.limit.toString());
      if (options.category) params = params.set('category', options.category);
      if (options.level) params = params.set('level', options.level);
      if (options.featured !== undefined) params = params.set('featured', options.featured.toString());
      if (options.published !== undefined) params = params.set('published', options.published.toString());
      if (options.active !== undefined) params = params.set('active', options.active.toString());
      if (options.search) params = params.set('search', options.search);
      if (options.sortBy) params = params.set('sortBy', options.sortBy);
      if (options.sortOrder) params = params.set('sortOrder', options.sortOrder);
    }

    return this.http.get<CourseResponse>(this.apiUrl, { params });
  }

  /**
   * Get featured courses
   */
  getFeaturedCourses(limit: number = 5): Observable<Course[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: Course[] }>(`${this.apiUrl}/featured`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Get courses for workshops/resources page
   */
  getWorkshopCourses(limit: number = 4): Observable<Course[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: Course[] }>(`${this.apiUrl}/workshops`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Get course categories
   */
  getCourseCategories(): Observable<string[]> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/meta/categories`)
      .pipe(map(response => response.data));
  }

  /**
   * Get course levels
   */
  getCourseLevels(): Observable<string[]> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/meta/levels`)
      .pipe(map(response => response.data));
  }

  /**
   * Get single course by ID
   */
  getCourseById(id: number): Observable<Course> {
    return this.http.get<{ success: boolean; data: Course }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Format course price
   */
  formatPrice(price?: number): string {
    if (price === null || price === undefined || typeof price !== 'number' || isNaN(price)) {
      return 'Free';
    }
    return `$${price.toFixed(2)}`;
  }

  /**
   * Get course availability status
   */
  getAvailabilityStatus(course: Course): {
    status: 'available' | 'full' | 'closed' | 'upcoming';
    message: string;
  } {
    const now = new Date();
    const registrationDeadline = course.registrationDeadline ? new Date(course.registrationDeadline) : null;
    const startDate = course.startDate ? new Date(course.startDate) : null;

    if (!course.isActive) {
      return { status: 'closed', message: 'Registration closed' };
    }

    if (registrationDeadline && now > registrationDeadline) {
      return { status: 'closed', message: 'Registration deadline passed' };
    }

    if (course.maxParticipants && course.currentParticipants >= course.maxParticipants) {
      return { status: 'full', message: 'Course is full' };
    }

    if (startDate && now > startDate) {
      return { status: 'closed', message: 'Course has already started' };
    }

    return { status: 'available', message: 'Registration open' };
  }

  /**
   * Get spots remaining
   */
  getSpotsRemaining(course: Course): number | null {
    if (!course.maxParticipants) return null;
    return Math.max(0, course.maxParticipants - course.currentParticipants);
  }

  /**
   * Format date for display
   */
  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * Get relative time until course starts
   */
  getTimeUntilStart(startDate: string): string {
    const now = new Date();
    const start = new Date(startDate);
    const diffTime = start.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return 'Started';
    } else if (diffDays === 0) {
      return 'Starts today';
    } else if (diffDays === 1) {
      return 'Starts tomorrow';
    } else if (diffDays < 7) {
      return `Starts in ${diffDays} days`;
    } else {
      const diffWeeks = Math.floor(diffDays / 7);
      return `Starts in ${diffWeeks} week${diffWeeks > 1 ? 's' : ''}`;
    }
  }
}
