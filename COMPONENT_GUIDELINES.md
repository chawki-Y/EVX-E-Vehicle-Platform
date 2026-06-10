# Component Development Guidelines

## 🧩 **Component Architecture**

### Component Structure
```typescript
@Component({
  selector: 'app-example',
  templateUrl: './example.component.html',
  styleUrls: ['./example.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ExampleComponent implements OnInit, OnDestroy {
  // Public properties (template bindings)
  @Input() data: ExampleData | null = null;
  @Output() action = new EventEmitter<ExampleAction>();
  
  // Private properties
  private destroy$ = new Subject<void>();
  
  constructor(
    private logger: LoggerService,
    private performance: PerformanceService
  ) {}
  
  ngOnInit(): void {
    this.performance.startMeasure('example-component-init');
    // Initialization logic
    this.performance.endMeasure('example-component-init');
  }
  
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
```

### Component Best Practices

#### 1. **Change Detection Strategy**
```typescript
// Use OnPush for better performance
changeDetection: ChangeDetectionStrategy.OnPush
```

#### 2. **Input Validation**
```typescript
@Input() 
set data(value: ExampleData | null) {
  if (value && this.isValidData(value)) {
    this._data = value;
  } else {
    this.logger.warn('Invalid data provided to component');
  }
}
get data(): ExampleData | null {
  return this._data;
}
private _data: ExampleData | null = null;
```

#### 3. **Memory Management**
```typescript
// Always unsubscribe to prevent memory leaks
ngOnDestroy(): void {
  this.destroy$.next();
  this.destroy$.complete();
}

// Use takeUntil pattern
this.dataService.getData()
  .pipe(takeUntil(this.destroy$))
  .subscribe(data => {
    // Handle data
  });
```

#### 4. **Error Handling**
```typescript
private handleError(error: any, context: string): void {
  this.logger.error(`Error in ${context}`, error);
  // Show user-friendly error message
  this.showErrorMessage('Something went wrong. Please try again.');
}
```

## 🎨 **Template Guidelines**

### Template Structure
```html
<!-- Loading state -->
<div *ngIf="isLoading" class="loading-container">
  <div class="spinner" aria-label="Loading..."></div>
</div>

<!-- Error state -->
<div *ngIf="error" class="error-container" role="alert">
  <p>{{ error.message }}</p>
  <button (click)="retry()" class="btn-secondary">Try Again</button>
</div>

<!-- Content -->
<div *ngIf="!isLoading && !error" class="content-container">
  <!-- Main content here -->
</div>
```

### Accessibility Best Practices
```html
<!-- Semantic HTML -->
<main role="main">
  <h1>Page Title</h1>
  <section aria-labelledby="section-title">
    <h2 id="section-title">Section Title</h2>
  </section>
</main>

<!-- ARIA attributes -->
<button 
  [attr.aria-expanded]="isExpanded"
  [attr.aria-controls]="contentId"
  (click)="toggle()">
  Toggle Content
</button>

<!-- Focus management -->
<input 
  #searchInput
  type="text"
  [attr.aria-describedby]="hasError ? 'error-message' : null"
  (keyup.enter)="search()">
```

## 🎯 **State Management**

### Component State Pattern
```typescript
interface ComponentState {
  loading: boolean;
  error: string | null;
  data: ExampleData[];
}

export class ExampleComponent {
  state: ComponentState = {
    loading: false,
    error: null,
    data: []
  };
  
  private updateState(updates: Partial<ComponentState>): void {
    this.state = { ...this.state, ...updates };
    this.cdr.markForCheck(); // For OnPush components
  }
  
  loadData(): void {
    this.updateState({ loading: true, error: null });
    
    this.dataService.getData()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => this.updateState({ loading: false, data }),
        error: (error) => this.updateState({ 
          loading: false, 
          error: 'Failed to load data' 
        })
      });
  }
}
```

## 🧪 **Testing Components**

### Component Test Template
```typescript
describe('ExampleComponent', () => {
  let component: ExampleComponent;
  let fixture: ComponentFixture<ExampleComponent>;
  let mockDataService: jasmine.SpyObj<DataService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('DataService', ['getData']);

    await TestBed.configureTestingModule({
      declarations: [ExampleComponent],
      providers: [
        { provide: DataService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ExampleComponent);
    component = fixture.componentInstance;
    mockDataService = TestBed.inject(DataService) as jasmine.SpyObj<DataService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load data on init', () => {
    const mockData = TestingUtils.createMockData();
    mockDataService.getData.and.returnValue(of(mockData));

    component.ngOnInit();

    expect(mockDataService.getData).toHaveBeenCalled();
    expect(component.state.data).toEqual(mockData);
  });

  it('should handle errors gracefully', () => {
    const error = new Error('API Error');
    mockDataService.getData.and.returnValue(throwError(error));

    component.loadData();

    expect(component.state.error).toBeTruthy();
    expect(component.state.loading).toBeFalse();
  });
});
```

## 🎨 **Styling Guidelines**

### Component CSS Structure
```css
/* Component host styles */
:host {
  display: block;
  position: relative;
}

/* BEM methodology */
.example {
  /* Block styles */
}

.example__element {
  /* Element styles */
}

.example__element--modifier {
  /* Modifier styles */
}

/* State classes */
.example--loading {
  opacity: 0.6;
  pointer-events: none;
}

.example--error {
  border-color: var(--error-color);
}

/* Responsive design */
@media (max-width: 768px) {
  .example {
    /* Mobile styles */
  }
}
```

### CSS Custom Properties Usage
```css
.example {
  background: var(--bg-primary);
  color: var(--text-primary);
  padding: var(--space-md);
  border-radius: var(--radius-md);
  transition: var(--transition-base);
}

.example:hover {
  background: var(--bg-secondary);
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}
```

## 🔄 **Performance Optimization**

### Lazy Loading
```typescript
// Route-level lazy loading
const routes: Routes = [
  {
    path: 'feature',
    loadChildren: () => import('./feature/feature.module').then(m => m.FeatureModule)
  }
];

// Component-level lazy loading
@Component({
  template: `
    <ng-container *ngIf="shouldLoadComponent">
      <app-heavy-component></app-heavy-component>
    </ng-container>
  `
})
```

### TrackBy Functions
```typescript
// Optimize *ngFor performance
trackByFn(index: number, item: ExampleItem): any {
  return item.id || index;
}
```

```html
<div *ngFor="let item of items; trackBy: trackByFn">
  {{ item.name }}
</div>
```

### Virtual Scrolling
```html
<!-- For large lists -->
<cdk-virtual-scroll-viewport itemSize="50" class="viewport">
  <div *cdkVirtualFor="let item of items">{{ item.name }}</div>
</cdk-virtual-scroll-viewport>
```

## 📱 **Responsive Design**

### Mobile-First Approach
```css
/* Mobile styles (default) */
.component {
  padding: var(--space-sm);
  font-size: var(--text-sm);
}

/* Tablet and up */
@media (min-width: 768px) {
  .component {
    padding: var(--space-md);
    font-size: var(--text-base);
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .component {
    padding: var(--space-lg);
    font-size: var(--text-lg);
  }
}
```

### Container Queries (Future)
```css
/* When supported */
@container (min-width: 400px) {
  .component {
    display: grid;
    grid-template-columns: 1fr 1fr;
  }
}
```

## 🔧 **Component Communication**

### Parent-Child Communication
```typescript
// Parent Component
@Component({
  template: `
    <app-child 
      [data]="parentData"
      (action)="handleChildAction($event)">
    </app-child>
  `
})
export class ParentComponent {
  parentData: ExampleData = { /* ... */ };
  
  handleChildAction(action: ExampleAction): void {
    // Handle child action
  }
}

// Child Component
@Component({
  selector: 'app-child'
})
export class ChildComponent {
  @Input() data: ExampleData | null = null;
  @Output() action = new EventEmitter<ExampleAction>();
  
  emitAction(): void {
    this.action.emit({ type: 'example', payload: this.data });
  }
}
```

### Service-Based Communication
```typescript
// Shared service for sibling communication
@Injectable()
export class ComponentCommunicationService {
  private actionSubject = new Subject<ExampleAction>();
  
  action$ = this.actionSubject.asObservable();
  
  emitAction(action: ExampleAction): void {
    this.actionSubject.next(action);
  }
}
```

---

## 📋 **Component Checklist**

### Before Creating a Component
- [ ] Is this component reusable?
- [ ] Does it have a single responsibility?
- [ ] Can it be tested in isolation?
- [ ] Does it follow the naming conventions?

### During Development
- [ ] Implement proper error handling
- [ ] Add loading and empty states
- [ ] Ensure accessibility compliance
- [ ] Optimize for performance
- [ ] Add proper TypeScript types

### Before Deployment
- [ ] Write unit tests
- [ ] Test on different screen sizes
- [ ] Verify accessibility with screen reader
- [ ] Check performance impact
- [ ] Update documentation