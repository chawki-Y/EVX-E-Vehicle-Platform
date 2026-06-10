export const environment = {
  production: false,
  apiUrl: 'http://localhost:3001/api',
  
  // Feature flags
  features: {
    enablePerformanceMonitoring: true,
    enableDetailedLogging: true,
    enablePreloading: true,
    enableServiceWorker: false,
    enableAnalytics: false,
    enableErrorReporting: false,
  },
  
  // Performance settings
  performance: {
    enableWebVitals: true,
    routePreloadDelay: 2000,
    imageOptimization: true,
    lazyLoadingThreshold: 0.1,
  },
  
  // Cache settings
  cache: {
    apiCacheDuration: 5 * 60 * 1000, // 5 minutes
    imageCacheDuration: 24 * 60 * 60 * 1000, // 24 hours
    enableServiceWorkerCache: false,
  },
  
  // Logging configuration
  logging: {
    level: 'debug',
    enableConsoleLogging: true,
    enableRemoteLogging: false,
    remoteLoggingUrl: '',
  },
  
  // External services
  services: {
    analyticsId: '',
    sentryDsn: '',
    hotjarId: '',
  },
  
  // UI settings
  ui: {
    defaultTheme: 'dark',
    enableThemeSwitcher: true,
    enableAccessibilityFeatures: true,
    animationDuration: 250,
  },
  
  // API configuration
  api: {
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  }
};