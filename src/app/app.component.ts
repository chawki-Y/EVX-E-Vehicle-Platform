import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, NavigationEnd, RouterModule } from '@angular/router';  
import { filter, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { HeaderComponent } from './components/header/header.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { ChatButtonComponent } from './components/chat-button/chat-button.component';
import { LoadingSpinnerComponent } from './components/loading-spinner/loading-spinner.component';
import { RouteTransitionService } from './services/route-transition.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, ToolbarComponent, ChatButtonComponent, LoadingSpinnerComponent],  
  template: `
    <div class="app-shell" [class.chat-layout]="isChatRoute">
      <app-header [f]="2"></app-header>  

      <main class="app-route">
        <router-outlet></router-outlet>
      </main>

      <app-toolbar [shouldShow]="showToolbar"></app-toolbar>
      <app-chat-button [shouldShow]="showChatButton"></app-chat-button>
    </div>
    
    <!-- Loading spinner for route transitions -->
    <app-loading-spinner 
      [isVisible]="isLoading" 
      [loadingText]="loadingText">
    </app-loading-spinner>
  `,
  styles: [`
    .app-shell.chat-layout {
      height: 100dvh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }

    .app-shell.chat-layout app-header {
      flex: 0 0 auto;
    }

    .app-shell.chat-layout .app-route {
      flex: 1 1 auto;
      min-height: 0;
      overflow: hidden;
    }
  `]
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'evx-client';
  showToolbar = true;
  showChatButton = true;
  isChatRoute = false;
  isLoading = false;
  loadingText = 'Loading...';
  
  private destroy$ = new Subject<void>();

  constructor(
    private router: Router,
    private routeTransitionService: RouteTransitionService
  ) {
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        takeUntil(this.destroy$)
      )
      .subscribe((event: any) => {
        const url = event.urlAfterRedirects;
        const routePath = url.split('?')[0];
        const isMessagesForumRoute = routePath.startsWith('/messages-forum');
        this.isChatRoute = routePath === '/chat';

        // Customize this logic based on what routes should show/hide the toolbar
        this.showToolbar = true;
        this.showChatButton = !isMessagesForumRoute && !this.isChatRoute;
        
        // Update loading text based on route
        this.updateLoadingText(url);
      });
  }

  ngOnInit(): void {
    // Subscribe to loading state from route transition service
    this.routeTransitionService.loading$
      .pipe(takeUntil(this.destroy$))
      .subscribe(loading => {
        this.isLoading = loading;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private updateLoadingText(url: string): void {
    // Customize loading text based on the route
    const routeTexts: { [key: string]: string } = {
      '/': 'Loading Home...',
      '/advanced-search': 'Loading Search...',
      '/tco-calculator': 'Loading Calculator...',
      '/resources': 'Loading Resources...',
      '/cart': 'Loading Cart...',
      '/likes': 'Loading Favorites...',
      '/messages-forum': 'Loading Forum...',
      '/chat': 'Loading Chat...'
    };

    // Check for dynamic routes
    if (url.includes('/product/')) {
      this.loadingText = 'Loading Product Details...';
    } else if (url.includes('/course/')) {
      this.loadingText = 'Loading Course...';
    } else if (url.includes('/news/')) {
      this.loadingText = 'Loading Article...';
    } else {
      this.loadingText = routeTexts[url] || 'Loading...';
    }
  }
}
