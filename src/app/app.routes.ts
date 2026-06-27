import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/home/home.component').then(module => module.HomeComponent)
  },
  {
    path: 'advanced-search',
    loadComponent: () => import('./pages/advanced-search/advanced-search.component').then(module => module.AdvancedSearchComponent)
  },
  {
    path: 'tco-calculator',
    loadComponent: () => import('./pages/tco-calculator/tco-calculator.component').then(module => module.TcoCalculatorComponent)
  },
  {
    path: 'resources',
    loadComponent: () => import('./pages/resources/resources.component').then(module => module.ResourcesComponent)
  },
  {
    path: 'course/:id',
    loadComponent: () => import('./pages/course-detail/course-detail.component').then(module => module.CourseDetailComponent)
  },
  {
    path: 'news/:slug',
    loadComponent: () => import('./pages/news-article/news-article.component').then(module => module.NewsArticleComponent)
  },
  {
    path: 'chat',
    loadComponent: () => import('./pages/chat/chat.component').then(module => module.ChatComponent)
  },
  {
    path: 'messages-forum/:id',
    loadComponent: () => import('./pages/messages-forum/messages-forum.component').then(module => module.MessagesForumComponent)
  },
  {
    path: 'likes',
    loadComponent: () => import('./pages/likes/likes.component').then(module => module.LikesComponent)
  },
  {
    path: 'cart',
    loadComponent: () => import('./pages/cart/cart.component').then(module => module.CartComponent)
  },
  {
    path: 'product/:type/:id',
    loadComponent: () => import('./pages/product-info/product-info.component').then(module => module.ProductInfoComponent)
  },
  { path: 'vehicle/:id', redirectTo: 'product/vehicle/:id' },
  { path: 'accessory/:id', redirectTo: 'product/accessory/:id' },
  { path: '**', redirectTo: '' }
];
