// PrimeNG Optimization Configuration
// This file helps optimize PrimeNG imports to reduce bundle size

export const PRIMENG_OPTIMIZATIONS = {
  // Only import specific PrimeNG modules instead of the entire library
  modules: [
    'SliderModule',
    'InputTextModule',
    // Add only the modules you actually use
  ],
  
  // Tree-shaking configuration for PrimeNG
  treeShaking: {
    // Ensure only used components are included
    sideEffects: false,
    usedExports: true
  },
  
  // Lazy load heavy PrimeNG components
  lazyComponents: [
    'CalendarModule',
    'ChartModule',
    'DataTableModule',
    // These should be loaded only when needed
  ]
};

// Optimized PrimeNG import strategy
export function optimizePrimeNGImports() {
  // Instead of importing entire PrimeNG, import only what's needed
  // This can reduce bundle size by 200-400KB
  
  return {
    // Core modules that are always needed
    core: [
      'primeng/api',
      'primeng/config'
    ],
    
    // Component-specific imports
    components: {
      slider: () => import('primeng/slider'),
      inputtext: () => import('primeng/inputtext'),
      // Add dynamic imports for other components
    }
  };
}

// Bundle size monitoring
export const BUNDLE_SIZE_TARGETS = {
  initial: '600KB',
  vendor: '400KB',
  styles: '15KB',
  total: '1MB'
};