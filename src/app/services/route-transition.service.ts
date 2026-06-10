import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { LoggerService } from './logger.service';
import { PerformanceService } from './performance.service';

@Injectable({
  providedIn: 'root'
})
export class RouteTransitionService {
  private loadingSubject = new BehaviorSubject<boolean>(false);
  public loading$ = this.loadingSubject.asObservable();
  private currentRoute: string = '';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object,
    private logger: LoggerService,
    private performanceService: PerformanceService
  ) {
    this.initializeRouteTransitions();
  }

  private initializeRouteTransitions(): void {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.handleNavigationStart(event);
      } else if (event instanceof NavigationEnd) {
        this.handleNavigationEnd(event);
      } else if (event instanceof NavigationCancel) {
        this.handleNavigationCancel(event);
      } else if (event instanceof NavigationError) {
        this.handleNavigationError(event);
      }
    });
  }

  private handleNavigationStart(event: NavigationStart): void {
    this.currentRoute = event.url;
    this.setLoading(true);
    this.addLoadingClass();
    this.performanceService.measureRouteChange(event.url);
    this.logger.debug(`Navigation started to: ${event.url}`);
  }

  private handleNavigationEnd(event: NavigationEnd): void {
    // Small delay to ensure styles are loaded
    setTimeout(() => {
      this.setLoading(false);
      this.removeLoadingClass();
      this.performanceService.endMeasure(`route-${this.currentRoute}`);
      this.logger.debug(`Navigation completed to: ${event.urlAfterRedirects}`);
    }, 100);
  }

  private handleNavigationCancel(event: NavigationCancel): void {
    this.setLoading(false);
    this.removeLoadingClass();
    this.performanceService.endMeasure(`route-${this.currentRoute}`);
    this.logger.warn(`Navigation cancelled to: ${event.url}`, event.reason);
  }

  private handleNavigationError(event: NavigationError): void {
    this.setLoading(false);
    this.removeLoadingClass();
    this.performanceService.endMeasure(`route-${this.currentRoute}`);
    this.logger.error(`Navigation error to: ${event.url}`, event.error);
  }

  private setLoading(loading: boolean): void {
    this.loadingSubject.next(loading);
  }

  private addLoadingClass(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        document.body.classList.add('route-loading');
      } catch (error) {
        this.logger.error('Failed to add loading class', error);
      }
    }
  }

  private removeLoadingClass(): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        document.body.classList.remove('route-loading');
      } catch (error) {
        this.logger.error('Failed to remove loading class', error);
      }
    }
  }

  // Method to preload route components
  preloadRoute(route: string): void {
    if (isPlatformBrowser(this.platformId)) {
      try {
        this.router.navigate([route], { skipLocationChange: true }).then(() => {
          // Navigate back without changing location
          window.history.back();
          this.logger.debug(`Preloaded route: ${route}`);
        }).catch(error => {
          this.logger.error(`Failed to preload route: ${route}`, error);
        });
      } catch (error) {
        this.logger.error(`Error preloading route: ${route}`, error);
      }
    }
  }
}