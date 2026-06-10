import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    // Preload routes that are likely to be visited
    const shouldPreload = this.shouldPreloadRoute(route);
    
    if (shouldPreload) {
      // Add a small delay to not interfere with initial page load
      return timer(2000).pipe(
        mergeMap(() => {
          console.log('Preloading route:', route.path);
          return load();
        })
      );
    }
    
    return of(null);
  }

  private shouldPreloadRoute(route: Route): boolean {
    // Define which routes should be preloaded
    const preloadRoutes = [
      'advanced-search',
      'tco-calculator',
      'resources',
      'likes',
      'cart'
    ];
    
    return route.path ? preloadRoutes.includes(route.path) : false;
  }
}