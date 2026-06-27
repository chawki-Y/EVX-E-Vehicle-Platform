import { Injectable } from '@angular/core';
import { PreloadingStrategy, Route } from '@angular/router';
import { Observable, of, timer } from 'rxjs';
import { mergeMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CustomPreloadingStrategy implements PreloadingStrategy {
  
  preload(route: Route, load: () => Observable<any>): Observable<any> {
    const shouldPreload = this.shouldPreloadRoute(route);
    
    if (shouldPreload) {
      return timer(2000).pipe(
        mergeMap(() => load())
      );
    }
    
    return of(null);
  }

  private shouldPreloadRoute(route: Route): boolean {
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
