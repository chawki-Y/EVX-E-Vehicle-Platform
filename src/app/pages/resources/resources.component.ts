import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { Router } from '@angular/router';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { FooterComponent } from '../../components/footer/footer.component';
import { NewsService, NewsArticle } from '../../services/news.service';
import { VideoService, Video } from '../../services/video.service';
import { CourseService, Course } from '../../services/course.service';

@Component({
  selector: 'app-resources',
  imports: [FooterComponent, CommonModule, HttpClientModule],
  templateUrl: './resources.component.html',
  styleUrl: './resources.component.css'
})
export class ResourcesComponent implements OnInit, OnDestroy {
  latestNews: NewsArticle[] = [];
  videos: Video[] = [];
  courses: Course[] = [];
  isLoading = true;
  isLoadingVideos = true;
  isLoadingCourses = true;
  error: string | null = null;
  videoError: string | null = null;
  courseError: string | null = null;
  
  // News display properties
  showAllNews = false; // Track whether to show all news or just first 3
  newsItemsToShow = 3; // Number of news items to show initially
  
  // Video slider properties
  currentVideoIndex = 0;
  videosPerView = 3;
  
  // Video player properties
  selectedVideo: Video | null = null;
  isVideoPlayerOpen = false;
  
  // Event listener reference for cleanup
  private resizeListener?: () => void;

  constructor(
    private newsService: NewsService,
    private videoService: VideoService,
    private courseService: CourseService,
    private router: Router,
    private sanitizer: DomSanitizer,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.updateViewportSettings();
    
    // Only load data in browser environment to prevent SSR issues
    if (isPlatformBrowser(this.platformId)) {
      this.loadLatestNews();
      this.loadVideos();
      this.loadCourses();
      
      this.resizeListener = () => this.updateViewportSettings();
      window.addEventListener('resize', this.resizeListener);
    }
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId) && this.resizeListener) {
      window.removeEventListener('resize', this.resizeListener);
    }
  }

  private updateViewportSettings(): void {
    if (isPlatformBrowser(this.platformId)) {
      const width = window.innerWidth;
      if (width <= 768) {
        this.videosPerView = 1;
      } else if (width <= 1200) {
        this.videosPerView = 2;
      } else {
        this.videosPerView = 3;
      }
      // Reset video index if it's out of bounds
      if (this.currentVideoIndex >= this.videos.length - this.videosPerView) {
        this.currentVideoIndex = Math.max(0, this.videos.length - this.videosPerView);
      }
    } else {
      // Default values for SSR
      this.videosPerView = 3;
    }
  }

  loadLatestNews(): void {
    this.isLoading = true;
    this.error = null;
    
    this.newsService.getLatestNews(12).subscribe({
      next: (news) => {
        this.latestNews = news;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading news:', error);
        this.error = 'Failed to load latest news. Please try again later.';
        this.isLoading = false;
      }
    });
  }

  loadVideos(): void {
    this.isLoadingVideos = true;
    this.videoError = null;
    
    this.videoService.getTutorialVideos(6).subscribe({
      next: (videos) => {
        this.videos = videos;
        this.isLoadingVideos = false;
        // Update viewport settings to ensure proper layout
        this.updateViewportSettings();
        // Reset video index if it's out of bounds
        if (this.currentVideoIndex >= this.videos.length - this.videosPerView) {
          this.currentVideoIndex = Math.max(0, this.videos.length - this.videosPerView);
        }
      },
      error: (error) => {
        console.error('Error loading videos:', error);
        this.videoError = 'Failed to load videos. Please try again later.';
        this.isLoadingVideos = false;
      }
    });
  }

  getNewsExcerpt(article: NewsArticle): string {
    return this.newsService.truncateText(article.excerpt || article.content, 120);
  }

  getRelativeTime(dateString: string): string {
    return this.newsService.getRelativeTime(dateString);
  }

  onNewsClick(article: NewsArticle): void {
    // Navigate to news article detail page using slug or id
    const identifier = article.slug || article.id.toString();
    this.router.navigate(['/news', identifier]);
  }

  // News display methods
  getDisplayedNews(): NewsArticle[] {
    if (this.showAllNews) {
      return this.latestNews;
    }
    return this.latestNews.slice(0, this.newsItemsToShow);
  }

  toggleShowAllNews(): void {
    this.showAllNews = !this.showAllNews;
  }

  hasMoreNews(): boolean {
    return this.latestNews.length > this.newsItemsToShow;
  }

  // Video slider methods
  nextVideo(): void {
    if (this.currentVideoIndex < this.videos.length - this.videosPerView) {
      this.currentVideoIndex++;
    }
  }

  previousVideo(): void {
    if (this.currentVideoIndex > 0) {
      this.currentVideoIndex--;
    }
  }

  goToVideo(index: number): void {
    this.currentVideoIndex = index;
  }

  onVideoClick(video: Video): void {
    // Open video in embedded player within the same page
    this.selectedVideo = video;
    this.isVideoPlayerOpen = true;
  }
  
  closeVideoPlayer(): void {
    this.selectedVideo = null;
    this.isVideoPlayerOpen = false;
  }
  
  getVideoEmbedUrl(video: Video): SafeResourceUrl {
    // Use the youtubeUrl directly from the backend
    // Convert watch URL to embed URL if needed
    let embedUrl = video.youtubeUrl;
    if (video.youtubeUrl.includes('watch?v=')) {
      const videoId = video.youtubeUrl.split('watch?v=')[1].split('&')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    } else if (video.youtubeUrl.includes('youtu.be/')) {
      const videoId = video.youtubeUrl.split('youtu.be/')[1].split('?')[0];
      embedUrl = `https://www.youtube.com/embed/${videoId}`;
    }
    return this.sanitizer.bypassSecurityTrustResourceUrl(embedUrl);
  }

  getVideoThumbnail(video: Video): string {
    // Use custom thumbnail if available, otherwise generate from YouTube ID
    return video.thumbnail || this.videoService.getYouTubeThumbnail(video.youtubeId, 'high');
  }

  formatViewCount(viewCount: number): string {
    if (viewCount >= 1000000) {
      return (viewCount / 1000000).toFixed(1) + 'M views';
    } else if (viewCount >= 1000) {
      return (viewCount / 1000).toFixed(1) + 'K views';
    } else {
      return viewCount + ' views';
    }
  }

  loadCourses(): void {
    this.isLoadingCourses = true;
    this.courseError = null;
    
    this.courseService.getWorkshopCourses(4).subscribe({
      next: (courses) => {
        this.courses = courses;
        this.isLoadingCourses = false;
      },
      error: (error) => {
        console.error('Error loading courses:', error);
        this.courseError = 'Failed to load courses. Please try again later.';
        this.isLoadingCourses = false;
      }
    });
  }

  onCourseClick(course: Course): void {
    // Navigate to course detail page
    this.router.navigate(['/course', course.id]);
  }

  formatCoursePrice(price?: number): string {
    return this.courseService.formatPrice(price);
  }

  getCourseAvailability(course: Course): string {
    const availability = this.courseService.getAvailabilityStatus(course);
    return availability.message;
  }

  getSpotsRemaining(course: Course): number | null {
    return this.courseService.getSpotsRemaining(course);
  }
}
