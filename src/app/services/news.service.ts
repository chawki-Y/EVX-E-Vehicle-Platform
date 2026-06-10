import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface NewsArticle {
  id: number;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  author: string;
  category: string;
  tags?: string[];
  publishedAt: string;
  isPublished: boolean;
  isFeatured: boolean;
  viewCount: number;
  slug?: string;
  metaDescription?: string;
}

export interface NewsResponse {
  success: boolean;
  data: NewsArticle[];
  pagination?: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
  };
}

export interface SingleNewsResponse {
  success: boolean;
  data: NewsArticle;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = `${environment.apiUrl}/news`;

  constructor(private http: HttpClient) {}

  /**
   * Get all news articles with optional filtering and pagination
   */
  getNews(options?: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    published?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Observable<NewsResponse> {
    let params = new HttpParams();

    if (options) {
      Object.keys(options).forEach(key => {
        const value = options[key as keyof typeof options];
        if (value !== undefined && value !== null) {
          params = params.set(key, value.toString());
        }
      });
    }

    return this.http.get<NewsResponse>(this.apiUrl, { params });
  }

  /**
   * Get latest news articles (for homepage/resources)
   */
  getLatestNews(limit: number = 6): Observable<NewsArticle[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<NewsResponse>(`${this.apiUrl}/latest`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Get featured news articles
   */
  getFeaturedNews(limit: number = 3): Observable<NewsArticle[]> {
    const params = new HttpParams().set('limit', limit.toString());

    return this.http.get<NewsResponse>(`${this.apiUrl}/featured`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Get a single news article by ID
   */
  getNewsById(id: number): Observable<NewsArticle> {
    return this.http.get<SingleNewsResponse>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }



  /**
   * Get single news article by ID or slug
   */
  getNewsArticle(identifier: string | number): Observable<NewsArticle> {
    return this.http.get<SingleNewsResponse>(`${this.apiUrl}/${identifier}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get related news articles (excluding current article)
   */
  getRelatedNews(currentId: number, limit: number = 3): Observable<NewsResponse> {
    return this.http.get<NewsResponse>(`${this.apiUrl}`, {
      params: {
        limit: limit.toString(),
        exclude: currentId.toString()
      }
    });
  }

  /**
   * Get all news categories
   */
  getNewsCategories(): Observable<string[]> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/meta/categories`)
      .pipe(map(response => response.data));
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
   * Get relative time (e.g., "2 days ago")
   */
  getRelativeTime(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
      }
      return diffInHours === 1 ? '1 hour ago' : `${diffInHours} hours ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 30) {
      const diffInWeeks = Math.floor(diffInDays / 7);
      return diffInWeeks === 1 ? '1 week ago' : `${diffInWeeks} weeks ago`;
    } else {
      return this.formatDate(dateString);
    }
  }

  /**
   * Truncate text to specified length
   */
  truncateText(text: string, maxLength: number = 150): string {
    if (text.length <= maxLength) {
      return text;
    }
    return text.substring(0, maxLength).trim() + '...';
  }
}
