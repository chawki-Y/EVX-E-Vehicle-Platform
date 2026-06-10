import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Video {
  id: number;
  title: string;
  description?: string;
  youtubeUrl: string;
  youtubeId: string;
  thumbnail?: string;
  duration?: string;
  category: string;
  tags: string[];
  isFeatured: boolean;
  isPublished: boolean;
  viewCount: number;
  publishedAt: string;
  sortOrder: number;
}

export interface VideoResponse {
  success: boolean;
  data: Video[];
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
export class VideoService {
  private apiUrl = `${environment.apiUrl}/videos`;

  constructor(private http: HttpClient) {}

  /**
   * Get all videos with optional filtering and pagination
   */
  getVideos(options?: {
    page?: number;
    limit?: number;
    category?: string;
    featured?: boolean;
    published?: boolean;
    search?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
  }): Observable<VideoResponse> {
    let params = new HttpParams();

    if (options) {
      if (options.page) params = params.set('page', options.page.toString());
      if (options.limit) params = params.set('limit', options.limit.toString());
      if (options.category) params = params.set('category', options.category);
      if (options.featured !== undefined) params = params.set('featured', options.featured.toString());
      if (options.published !== undefined) params = params.set('published', options.published.toString());
      if (options.search) params = params.set('search', options.search);
      if (options.sortBy) params = params.set('sortBy', options.sortBy);
      if (options.sortOrder) params = params.set('sortOrder', options.sortOrder);
    }

    return this.http.get<VideoResponse>(this.apiUrl, { params });
  }

  /**
   * Get featured videos
   */
  getFeaturedVideos(limit: number = 5): Observable<Video[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: Video[] }>(`${this.apiUrl}/featured`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Get videos for tutorials/resources page
   */
  getTutorialVideos(limit: number = 6): Observable<Video[]> {
    const params = new HttpParams().set('limit', limit.toString());
    return this.http.get<{ success: boolean; data: Video[] }>(`${this.apiUrl}/tutorials`, { params })
      .pipe(map(response => response.data));
  }

  /**
   * Get video categories
   */
  getVideoCategories(): Observable<string[]> {
    return this.http.get<{ success: boolean; data: string[] }>(`${this.apiUrl}/meta/categories`)
      .pipe(map(response => response.data));
  }

  /**
   * Get single video by ID
   */
  getVideoById(id: number): Observable<Video> {
    return this.http.get<{ success: boolean; data: Video }>(`${this.apiUrl}/${id}`)
      .pipe(map(response => response.data));
  }

  /**
   * Get YouTube embed URL from video ID
   */
  getYouTubeEmbedUrl(youtubeId: string): string {
    return `https://www.youtube.com/embed/${youtubeId}`;
  }

  /**
   * Get YouTube thumbnail URL
   */
  getYouTubeThumbnail(youtubeId: string, quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'): string {
    return `https://img.youtube.com/vi/${youtubeId}/${quality}default.jpg`;
  }

  /**
   * Extract YouTube video ID from URL
   */
  extractYouTubeId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }

  /**
   * Format video duration
   */
  formatDuration(duration: string): string {
    if (!duration) return '';

    // If duration is already in MM:SS format, return as is
    if (duration.includes(':')) {
      return duration;
    }

    // Convert seconds to MM:SS format
    const totalSeconds = parseInt(duration);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }
}
