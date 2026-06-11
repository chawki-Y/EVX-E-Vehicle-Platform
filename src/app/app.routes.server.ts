import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'advanced-search',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'tco-calculator',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'resources',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'likes',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'cart',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'chat',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'course/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'news/:slug',
    renderMode: RenderMode.Server
  },
  {
    path: 'news/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'messages-forum/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'product/:type/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'vehicle/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'accessory/:id',
    renderMode: RenderMode.Server
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
