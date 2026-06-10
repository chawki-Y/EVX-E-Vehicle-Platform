import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { NewsService, NewsArticle } from '../../services/news.service';

@Component({
  selector: 'app-news-article',
  imports: [CommonModule, FooterComponent],
  templateUrl: './news-article.component.html',
  styleUrl: './news-article.component.css'
})
export class NewsArticleComponent implements OnInit {
  article: NewsArticle | null = null;
  isLoading = true;
  error: string | null = null;
  relatedNews: NewsArticle[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = params['id'];
      const slug = params['slug'];
      
      // Only load article data in browser environment to prevent SSR issues
      if (isPlatformBrowser(this.platformId)) {
        if (slug) {
          this.loadArticleBySlug(slug);
        } else if (id) {
          this.loadArticleById(+id);
        } else {
          this.error = 'Invalid article identifier';
          this.isLoading = false;
        }
      } else {
        // Set loading to false for SSR to prevent infinite loading state
        this.isLoading = false;
      }
    });
  }

  loadArticleById(id: number): void {
    this.isLoading = true;
    this.error = null;
    
    this.newsService.getNewsById(id).subscribe({
      next: (article: NewsArticle) => {
        this.article = article;
        this.isLoading = false;
        this.loadRelatedNews();
      },
      error: (error: any) => {
        console.error('Error loading article by ID:', error);
        this.error = 'Article not found or failed to load.';
        this.isLoading = false;
      }
    });
  }

  loadArticleBySlug(slug: string): void {
    this.isLoading = true;
    this.error = null;
    
    this.newsService.getNewsArticle(slug).subscribe({
      next: (article: NewsArticle) => {
        this.article = article;
        this.isLoading = false;
        this.loadRelatedNews();
      },
      error: (error: any) => {
        console.error('Error loading article:', error);
        this.error = 'Article not found or failed to load.';
        this.isLoading = false;
      }
    });
  }

  loadRelatedNews(): void {
    if (!this.article) return;
    
    this.newsService.getNews({
      category: this.article.category,
      limit: 3
    }).subscribe({
      next: (response: any) => {
        // Filter out the current article
        this.relatedNews = response.data.filter((news: NewsArticle) => news.id !== this.article!.id);
      },
      error: (error: any) => {
        console.error('Error loading related news:', error);
      }
    });
  }

  formatDate(dateString: string): string {
    return this.newsService.formatDate(dateString);
  }

  getRelativeTime(dateString: string): string {
    return this.newsService.getRelativeTime(dateString);
  }

  onRelatedNewsClick(article: NewsArticle): void {
    const route = article.slug ? `/news/${article.slug}` : `/news/${article.id}`;
    this.router.navigate([route]);
  }

  goBack(): void {
    this.router.navigate(['/resources']);
  }

  shareArticle(): void {
    if (navigator.share && this.article) {
      navigator.share({
        title: this.article.title,
        text: this.article.excerpt || this.article.title,
        url: window.location.href
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
        alert('Article URL copied to clipboard!');
      }).catch(err => {
        console.error('Failed to copy URL:', err);
      });
    }
  }
}