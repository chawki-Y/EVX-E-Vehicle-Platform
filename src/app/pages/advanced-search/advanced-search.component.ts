import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NgSelectModule } from '@ng-select/ng-select';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { VehicleDetailsPopupComponent } from '../../components/vehicle-details-popup/vehicle-details-popup.component';
import { VehicleComparisonComponent } from '../../components/vehicle-comparison/vehicle-comparison.component';
import { FooterComponent } from '../../components/footer/footer.component';
import { CartService } from '../../services/cart.service';
import { LikesService } from '../../services/likes.service';
import { VehicleService, Vehicle, VehicleFilters, VehicleResponse, Accessory, ExtendedVehicle, DisplayItem, ItemFilters, ItemResponse, VehicleSpecificFilters, AccessorySpecificFilters } from '../../services/vehicle.service';
import { Subject, takeUntil, debounceTime, distinctUntilChanged } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

// Interfaces are now imported from the service

interface SortOption {
  value: string;
  label: string;
}

@Component({
  selector: 'app-advanced-search',
  standalone: true,
  imports: [NgSelectModule, CommonModule, FormsModule, SliderModule, InputTextModule, VehicleDetailsPopupComponent, VehicleComparisonComponent, FooterComponent],
  templateUrl: './advanced-search.component.html',
  styleUrl: './advanced-search.component.css'
})
export class AdvancedSearchComponent implements OnInit, OnDestroy {
  searchQuery: string = '';
  currentSlide: number = 0;
  heroVehicles: Vehicle[] = [];
  private destroy$ = new Subject<void>();
  private searchSubject = new Subject<string>();

  // Categories for filter checkboxes
  categories: string[] = ['Sedan', 'SUV', 'Coupe', 'Crossover', 'Hatchback', 'Pickup', 'Roadster', 'Sports', 'Truck'];

  // Types for filter (vehicles or accessories)
  types: string[] = ['Vehicles', 'Accessories'];
  selectedTypes: string[] = ['Vehicles']; // Default to vehicles only

  // Pagination properties
  currentPage: number = 1;
  itemsPerPage: number = 12;
  totalPages: number = 1;
  totalItems: number = 0; // Total items from server for pagination info
  isMobile: boolean = false;

  // Popup properties
  isPopupVisible: boolean = false;
  selectedVehicle: Vehicle | null = null;

  // Comparison properties
  isComparisonVisible: boolean = false;
  comparedVehicles: Vehicle[] = [];
  maxComparisonItems: number = 2;

  vehicles: ExtendedVehicle[] = [];
  accessories: Accessory[] = [];
  displayItems: DisplayItem[] = []; // Combined vehicles and accessories for display

  // Removed mock data - now using actual data from service

  filteredVehicles: ExtendedVehicle[] = [];
  filteredAccessories: Accessory[] = [];
  filteredItems: DisplayItem[] = []; // Combined filtered items for display

  // Filter states
  selectedConditions: string[] = [];
  selectedCategories: string[] = [];
  selectedBrands: string[] = [];
  selectedDealers: string[] = [];
  dealers: string[] = [];
  brands: string[] = [];

  // Vehicle-specific filters
  vehicleFilters: VehicleSpecificFilters = {
    range: [200, 450],
    year: [2020, 2025],
    isElectric: true
  };

  // Accessory-specific filters
  accessoryFilters: AccessorySpecificFilters = {
    compatibility: [],
    installationType: [],
    warranty: [],
    material: []
  };

  // Dynamic filter options based on type
  vehicleCategories: string[] = ['Sedan', 'SUV', 'Coupe', 'Crossover', 'Hatchback', 'Pickup', 'Roadster', 'Sports', 'Truck'];
  accessoryCategories: string[] = ['Charging', 'Interior', 'Exterior', 'Safety', 'Performance', 'Comfort'];

  compatibilityOptions: string[] = [];
  installationTypes: string[] = ['Professional Installation', 'DIY Installation'];
  warrantyOptions: string[] = ['1 Year', '2 Years', '3 Years', '5 Years', 'Lifetime'];
  materialOptions: string[] = ['Carbon Fiber', 'Aluminum', 'Plastic', 'Leather', 'Fabric', 'Rubber'];

  // Price Filter (changed to camelCase)
  priceMinValue: number = 0;
  priceMaxValue: number = 100;
  priceValues: number[] = [this.priceMinValue, this.priceMaxValue];

  // Range Filter (changed to camelCase)
  rangeMinValue: number = 0;
  rangeMaxValue: number = 100;
  rangeValues: number[] = [this.rangeMinValue, this.rangeMaxValue];

  // Filter visibility for mobile
  isFiltersVisible: boolean = true;

  // Sort options (renamed for consistency)
  selectedSortOption: string = 'Relevance';
  sortOptions: SortOption[] = [
    { value: 'Relevance', label: 'Relevance' },
    { value: 'Price Asc', label: 'Price - Low to High' },
    { value: 'Price Desc', label: 'Price - High to Low' },
    { value: 'Range Desc', label: 'Range - High to Low' },
    { value: 'Rating Desc', label: 'Highest Rated' },
    { value: 'Year Desc', label: 'Newest First' },
    { value: 'Name Asc', label: 'A-Z' }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private likesService: LikesService,
    private cartService: CartService,
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchQuery = params['q'] || '';
    });

    // Initialize empty arrays - data will be loaded from service
    this.vehicles = [];
    this.accessories = [];
    this.checkMobileScreen();
    this.updateItemsPerPage();
    this.initializeSearchDebounce();
    
    // Only load data in browser environment to prevent SSR issues
    if (isPlatformBrowser(this.platformId)) {
      // Load data first, then update filters
      this.loadDataAndFilters();
      
      this.loadHeroVehicles();
      this.startHeroCarousel();
      this.subscribeToLikesChanges();

      // Listen for window resize to update mobile detection
      window.addEventListener('resize', this.onWindowResize);
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();

    // Clean up window resize listener (only in browser)
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('resize', this.onWindowResize);
    }
  }

  // Bound method for window resize to enable proper cleanup
  private onWindowResize = () => {
    this.checkMobileScreen();
    this.updateItemsPerPage();
  };

  private initializeSearchDebounce(): void {
    this.searchSubject.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(searchTerm => {
      this.searchQuery = searchTerm;
      this.loadVehicles();
    });
  }

  private loadVehicles(): void {
    // Build filters object
    const filters: ItemFilters = {
      priceMin: this.priceValues[0] * 1000,
      priceMax: this.priceValues[1] * 1000,
      rangeMin: this.rangeValues[0],
      rangeMax: this.rangeValues[1],
      search: this.searchQuery || undefined,
      types: this.selectedTypes.map(type => type.toLowerCase()),
      conditions: this.selectedConditions.length > 0 ? this.selectedConditions : undefined,
      categories: this.selectedCategories.length > 0 ? this.selectedCategories : undefined,
      brands: this.selectedBrands.length > 0 ? this.selectedBrands : undefined,
      dealers: this.selectedDealers.length > 0 ? this.selectedDealers : undefined
    };

    // Get sort value
    const sortBy = this.getSortByValue();

    // Call the service to get items
    this.vehicleService.getItems(filters, sortBy, this.currentPage, this.itemsPerPage, 1)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: ItemResponse) => {
          if (response.success) {
            this.filteredItems = response.data;

            // Separate vehicles and accessories for backward compatibility
            this.filteredVehicles = response.data.filter(item => item.type === 'vehicle') as ExtendedVehicle[];
            this.filteredAccessories = response.data.filter(item => item.type === 'accessory') as Accessory[];

            // Update pagination from response
            this.totalPages = response.pagination.totalPages;
            this.currentPage = response.pagination.currentPage;
            this.totalItems = response.pagination.totalItems;

            this.updateLikeStatuses();
          }
        },
        error: (error) => {
          console.error('Error loading items:', error);
          // Set empty arrays if service fails
          this.filteredItems = [];
          this.filteredVehicles = [];
          this.filteredAccessories = [];
          this.totalPages = 1;
          this.currentPage = 1;
          this.totalItems = 0;
        }
      });
  }

  // Removed loadVehiclesFromMock method - now using actual data from service

  private loadHeroVehicles(): void {
    this.vehicleService.getHeroVehicles()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (heroVehicles: Vehicle[]) => {
          this.heroVehicles = heroVehicles;
          this.updateLikeStatuses();
        },
        error: (error) => {
          console.error('Error loading hero vehicles:', error);
          this.heroVehicles = [];
        }
      });
  }

  private loadDataAndFilters(): void {
    // Load filter options and dealers separately
    this.vehicleService.getFilterOptions()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (options) => {
          this.categories = options.categories;
          this.sortOptions = options.sortOptions;
          
          // Load dealers using the new endpoint
          this.loadDealers();
          
          // After filter options are loaded, load the actual data
          this.loadVehicles();
        },
        error: (error) => {
          console.error('Error loading filter options:', error);
          // Fallback: load actual data to populate filter options
          this.loadActualDataForFilters();
        }
      });
  }

  private loadDealers(): void {
    // Load dealers based on selected types
    if (this.selectedTypes.includes('Vehicles') && this.selectedTypes.includes('Accessories')) {
      // Get all dealers from both vehicles and accessories
      this.vehicleService.getDealers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dealers) => {
            this.dealers = dealers;
          },
          error: (error) => {
            console.error('Error fetching dealers:', error);
            this.dealers = [];
          }
        });
    } else if (this.selectedTypes.includes('Vehicles')) {
      // Get dealers from vehicles only
      this.vehicleService.getVehicleDealers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dealers) => {
            this.dealers = dealers;
          },
          error: (error) => {
            console.error('Error fetching vehicle dealers:', error);
            this.dealers = [];
          }
        });
    } else if (this.selectedTypes.includes('Accessories')) {
      // Get dealers from accessories only
      this.vehicleService.getAccessoryDealers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dealers) => {
            this.dealers = dealers;
          },
          error: (error) => {
            console.error('Error fetching accessory dealers:', error);
            this.dealers = [];
          }
        });
    } else {
      this.dealers = [];
    }
  }

  private loadActualDataForFilters(): void {
    // Load vehicles and accessories to populate filter options
    const vehicleFilters = {};
    const accessoryFilters = {};

    // Load vehicles for filter options
    this.vehicleService.getVehicles(vehicleFilters, 'name_asc', 1, 1000)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (vehicleResponse) => {
          const vehicles = vehicleResponse.data;
          
          // Load accessories for filter options
          this.vehicleService.getAccessories(accessoryFilters, 'name_asc', 1, 1000)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: (accessoryResponse) => {
                const accessories = accessoryResponse.data;
                
                // Store all data for filtering
                this.vehicles = vehicles.map(v => ({ ...v, type: 'vehicle' as const }));
                this.accessories = accessories;
                
                // Extract filter options from the loaded data
                this.updateFilterOptionsFromData(vehicles, accessories);
                
                // Now load the filtered data
                this.loadVehicles();
              },
              error: (error) => {
                console.error('Error loading accessories for filters:', error);
                // Load vehicles anyway
                this.loadVehicles();
              }
            });
        },
        error: (error) => {
          console.error('Error loading vehicles for filters:', error);
          // Load vehicles anyway
          this.loadVehicles();
        }
      });
  }

  private updateFilterOptionsFromData(vehicles: Vehicle[], accessories: Accessory[]): void {
    // Extract categories from both vehicles and accessories
    const vehicleCategories = [...new Set(vehicles.map(v => v.category))];
    const accessoryCategories = [...new Set(accessories.map(a => a.category))];
    this.categories = [...new Set([...vehicleCategories, ...accessoryCategories])].sort();

    // Extract brands from both vehicles and accessories
    const vehicleBrands = [...new Set(vehicles.map(v => v.brand))];
    const accessoryBrands = [...new Set(accessories.map(a => a.brand))];
    this.brands = [...new Set([...vehicleBrands, ...accessoryBrands])].sort();

    // Update dealers based on selected types
    this.dealers = this.getDealersForSelectedTypes();

    // Extract compatibility options from accessories
    const compatibilitySet = new Set<string>();
    accessories.forEach(accessory => {
      if (accessory.compatibility) {
        accessory.compatibility.forEach(comp => compatibilitySet.add(comp));
      }
    });
    this.compatibilityOptions = Array.from(compatibilitySet).sort();
  }



  private subscribeToLikesChanges(): void {
    this.likesService.likes$
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.updateLikeStatuses();
      });
  }

  private updateLikeStatuses(): void {
    this.vehicles.forEach(vehicle => {
      vehicle.isLiked = this.likesService.isLiked(vehicle.id, 'vehicle');
    });
    this.heroVehicles.forEach(vehicle => {
      vehicle.isLiked = this.likesService.isLiked(vehicle.id, 'vehicle');
    });
    this.filteredVehicles.forEach(vehicle => {
      vehicle.isLiked = this.likesService.isLiked(vehicle.id, 'vehicle');
    });
    this.filteredAccessories.forEach(accessory => {
      accessory.isLiked = this.likesService.isLiked(accessory.id, 'accessory');
    });
    this.accessories.forEach(accessory => {
      accessory.isLiked = this.likesService.isLiked(accessory.id, 'accessory');
    });
  }

  private getSortByValue(): string {
    const sortMap: { [key: string]: string } = {
      'Relevance': 'rating_desc',
      'Price Asc': 'price_asc',
      'Price Desc': 'price_desc',
      'Range Desc': 'range_desc',
      'Rating Desc': 'rating_desc',
      'Year Desc': 'year_desc',
      'Name Asc': 'name_asc'
    };
    return sortMap[this.selectedSortOption] || 'rating_desc';
  }

  // Hero Carousel
  startHeroCarousel(): void {
    setInterval(() => {
      this.nextSlide();
    }, 5000);
  }

  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroVehicles.length;
  }

  prevSlide(): void {
    this.currentSlide = this.currentSlide > 0 ? this.currentSlide - 1 : this.heroVehicles.length - 1;
  }

  getCurrentHeroVehicle(): Vehicle | undefined {
    if (this.heroVehicles.length === 0 || this.currentSlide < 0 || this.currentSlide >= this.heroVehicles.length) {
      return undefined;
    }
    return this.heroVehicles[this.currentSlide];
  }

  // Filter methods
  updatePrice(): void {
    if (this.priceMinValue < 0) this.priceMinValue = 0;
    if (this.priceMaxValue > 900) this.priceMaxValue = 900;
    if (this.priceMinValue > this.priceMaxValue) this.priceMinValue = this.priceMaxValue;

    this.priceValues = [this.priceMinValue, this.priceMaxValue];
    this.applyFilters();
  }

  onPriceSliderChange(event: any): void {
    this.priceMinValue = this.priceValues[0];
    this.priceMaxValue = this.priceValues[1];
    this.applyFilters();
  }

  updateRange(): void {
    if (this.rangeMinValue < 0) this.rangeMinValue = 0;
    if (this.rangeMaxValue > 500) this.rangeMaxValue = 500;
    if (this.rangeMinValue > this.rangeMaxValue) this.rangeMinValue = this.rangeMaxValue;

    this.rangeValues = [this.rangeMinValue, this.rangeMaxValue];
    this.applyFilters();
  }

  onRangeSliderChange(event: any): void {
    this.rangeMinValue = this.rangeValues[0];
    this.rangeMaxValue = this.rangeValues[1];
    this.applyFilters();
  }

  onConditionChange(condition: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      this.selectedConditions.push(condition);
    } else {
      this.selectedConditions = this.selectedConditions.filter(c => c !== condition);
    }
    this.applyFilters();
  }

  onCategoryChange(category: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories = this.selectedCategories.filter(c => c !== category);
    }
    this.applyFilters();
  }

  onTypeChange(type: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      this.selectedTypes.push(type);
    } else {
      this.selectedTypes = this.selectedTypes.filter(t => t !== type);
    }
    
    // Update dealer filter based on selected types
    this.applyFilters();
    this.updateDealerFilter();

  }

  onBrandChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedBrand = target.value;

    if (selectedBrand) {
      this.selectedBrands = [selectedBrand];
    } else {
      this.selectedBrands = [];
    }
    this.applyFilters();
  }

  onDealerChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedDealer = target.value;

    if (selectedDealer) {
      this.selectedDealers = [selectedDealer];
    } else {
      this.selectedDealers = [];
    }
    this.applyFilters();
  }

  // Update dealer filter based on selected types
  updateDealerFilter(): void {
    console.log('Updating dealer filter for types:', this.selectedTypes);
    
    // Use the new backend endpoint to get dealers
    if (this.selectedTypes.includes('Vehicles') && this.selectedTypes.includes('Accessories')) {
      // Get all dealers from both vehicles and accessories
      this.vehicleService.getDealers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dealers) => {
            this.dealers = dealers;
            this.clearInvalidSelectedDealers();
          },
          error: (error) => {
            console.error('Error fetching dealers:', error);
            // Fallback to current method
            this.dealers = this.getDealersForSelectedTypes();
            this.clearInvalidSelectedDealers();
          }
        });
    } else if (this.selectedTypes.includes('Vehicles')) {
      // Get dealers from vehicles only
      this.vehicleService.getVehicleDealers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dealers) => {
            this.dealers = dealers;
            this.clearInvalidSelectedDealers();
          },
          error: (error) => {
            console.error('Error fetching vehicle dealers:', error);
            // Fallback to current method
            this.dealers = this.getDealersForSelectedTypes();
            this.clearInvalidSelectedDealers();
          }
        });
    } else if (this.selectedTypes.includes('Accessories')) {
      // Get dealers from accessories only
      this.vehicleService.getAccessoryDealers()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (dealers) => {
            this.dealers = dealers;
            this.clearInvalidSelectedDealers();
          },
          error: (error) => {
            console.error('Error fetching accessory dealers:', error);
            // Fallback to current method
            this.dealers = this.getDealersForSelectedTypes();
            this.clearInvalidSelectedDealers();
          }
        });
    } else {
      // No types selected, clear dealers
      this.dealers = [];
      this.selectedDealers = [];
    }
  }

  // Helper method to clear invalid selected dealers
  private clearInvalidSelectedDealers(): void {
    // Clear selected dealers if they're no longer available
    this.selectedDealers = this.selectedDealers.filter(dealer => 
      this.dealers.includes(dealer)
    );
    // Force change detection to update UI
    this.cdr.detectChanges();
  }

  // Get dealers based on selected types
  getDealersForSelectedTypes(): string[] {
    let dealers: string[] = [];
    
    if (this.selectedTypes.includes('Vehicles')) {
      const vehicleDealers = [...new Set(this.filteredVehicles.map(v => v.dealer.name))];
      dealers = [...dealers, ...vehicleDealers];
    }
    
    if (this.selectedTypes.includes('Accessories')) {
      const accessoryDealers = [...new Set(this.filteredAccessories.map(a => a.dealer.name))];
      dealers = [...dealers, ...accessoryDealers];
    }
    
    // Remove duplicates and sort
    return [...new Set(dealers)].sort();
  }

  applyFilters(): void {
    this.currentPage = 1; // Reset to first page when filters change
    this.loadVehicles();
  }

  onSortChange(): void {
    this.loadVehicles();
  }

  resetFilters(): void {
    this.priceMinValue = 0;
    this.priceMaxValue = 100;
    this.priceValues = [0, 100];
    this.rangeMinValue = 0;
    this.rangeMaxValue = 100;
    this.rangeValues = [0, 100];
    this.selectedConditions = [];
    this.selectedCategories = [];
    this.selectedBrands = [];
    this.selectedDealers = [];
    this.selectedTypes = ['Vehicles']; // Reset to default
    this.selectedSortOption = 'Relevance';
    this.searchQuery = '';

    // Reset vehicle-specific filters
    this.vehicleFilters = {
      range: [200, 450],
      year: [2020, 2025],
      isElectric: true
    };

    // Reset accessory-specific filters
    this.accessoryFilters = {
      compatibility: [],
      installationType: [],
      warranty: [],
      material: []
    };

    // Update dealer filter based on reset types
    
    this.applyFilters();
    this.updateDealerFilter();
  }

  // Toggle filter visibility for mobile
  toggleFilters(): void {
    this.isFiltersVisible = !this.isFiltersVisible;
    this.updateItemsPerPage();
    this.currentPage = 1; // Reset to first page when toggling filters
    this.loadVehicles();
  }

  // Mobile detection method
  private checkMobileScreen(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
    } else {
      // Default to desktop for SSR
      this.isMobile = false;
    }
  }

  // Update items per page based on mobile and filter visibility
  private updateItemsPerPage(): void {
    if (this.isMobile && this.isFiltersVisible) {
      this.itemsPerPage = 4;
    } else {
      this.itemsPerPage = 12;
    }
  }

  private applySorting(items: DisplayItem[]): void {
    const sortBy = this.getSortByValue();

    items.sort((a, b) => {
      switch (sortBy) {
        case 'price_asc':
          return a.price - b.price;
        case 'price_desc':
          return b.price - a.price;
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'name_desc':
          return b.name.localeCompare(a.name);
        case 'rating_desc':
          return b.rating - a.rating;
        case 'year_desc':
          // Only vehicles have year property
          if ('year' in a && 'year' in b && a.year && b.year) {
            return b.year - a.year;
          }
          return 0;
        case 'range_desc':
          // Only electric vehicles have range property
          const aRange = ('range' in a && a.range) ? a.range : 0;
          const bRange = ('range' in b && b.range) ? b.range : 0;
          return bRange - aRange;
        default:
          return 0;
      }
    });
  }

  // Pagination methods
  calculatePagination(): void {
    this.totalPages = Math.ceil(this.filteredItems.length / this.itemsPerPage);
  }

  getPaginatedVehicles(): ExtendedVehicle[] {
    // Since loadVehicles() already handles server-side pagination,
    // filteredVehicles already contains only the vehicles for the current page
    return this.filteredVehicles;
  }

  getPaginatedItems(): DisplayItem[] {
    // Since loadVehicles() already handles server-side pagination,
    // filteredItems already contains only the items for the current page
    return this.filteredItems;
  }

  getPaginationInfo(): string {
    if (!this.filteredItems || this.filteredItems.length === 0 || this.totalItems === 0) {
      return 'Showing 0 products';
    }

    const startIndex = (this.currentPage - 1) * this.itemsPerPage + 1;
    const endIndex = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    const total = this.totalItems;

    if (total <= this.itemsPerPage) {
      return `Showing ${total} products`;
    }

    return `Showing ${startIndex}-${endIndex} of ${total} products`;
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      // Load new data for the selected page
      this.loadVehicles();
      // Scroll to top of the grid for better user experience
      const gridElement = document.querySelector('.vehicle-grid-container');
      if (gridElement) {
        gridElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }

  getPageNumbers(): number[] {
    const pageNumbers: number[] = [];
    const maxVisiblePages = 5;

    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return pageNumbers;
  }

  // Vehicle and Accessory actions
  toggleLike(item: DisplayItem): void {
    // Handle both vehicles and accessories with persistent storage
    this.likesService.toggleLike(item).subscribe({
      next: (isLiked) => {
        item.isLiked = isLiked;
        console.log(`${item.type === 'accessory' ? 'Accessory' : 'Vehicle'} ${item.name} ${isLiked ? 'liked' : 'unliked'}`);
      },
      error: (error) => {
        console.error(`Error toggling ${item.type} like:`, error);
      }
    });
  }

  toggleCompare(item: DisplayItem): void {
    if (item.isCompared) {
      // Remove from comparison
      this.removeFromComparison(item as Vehicle);
    } else {
      // Add to comparison
      this.addToComparison(item as Vehicle);
    }
  }

  addToComparison(vehicle: Vehicle): void {
    if (this.comparedVehicles.length >= this.maxComparisonItems) {
      // Remove the first vehicle if we've reached the limit
      const removedVehicle = this.comparedVehicles.shift();
      if (removedVehicle) {
        removedVehicle.isCompared = false;
      }
    }

    vehicle.isCompared = true;
    this.comparedVehicles.push(vehicle);

    // Auto-open comparison modal when 2 vehicles are selected
    if (this.comparedVehicles.length === 2) {
      this.openComparison();
    }
  }

  removeFromComparison(vehicle: Vehicle): void {
    vehicle.isCompared = false;
    this.comparedVehicles = this.comparedVehicles.filter(v => v.id !== vehicle.id);
  }

  openComparison(): void {
    this.isComparisonVisible = true;
  }

  closeComparison(): void {
    this.isComparisonVisible = false;
  }

  onComparisonRemoveVehicle(vehicle: Vehicle): void {
    this.removeFromComparison(vehicle);
  }

  onComparisonAddToCart(itemId: number): void {
    this.addToCart(itemId);
  }

  onComparisonToggleLike(vehicle: Vehicle): void {
    const extendedVehicle: ExtendedVehicle = {
      ...vehicle,
      type: 'vehicle' as const
    };
    this.toggleLike(extendedVehicle);
  }

  getComparedVehiclesCount(): number {
    return this.comparedVehicles.length;
  }

  hasComparedVehicles(): boolean {
    return this.comparedVehicles.length > 0;
  }

  viewVehicleInfo(item: any): void {
    if (item) {
      const itemType = item.type === 'accessory' ? 'accessory' : 'vehicle';
      this.router.navigate(['/product', itemType, item.id]);
    }
  }

  closePopup(): void {
    this.isPopupVisible = false;
    this.selectedVehicle = null;
  }

  onPopupAddToCart(itemId: number): void {
    this.addToCart(itemId);
    // Optionally close popup after adding to cart
    // this.closePopup();
  }

  onPopupToggleLike(vehicle: Vehicle): void {
    const extendedVehicle: ExtendedVehicle = {
      ...vehicle,
      type: 'vehicle' as const
    };
    this.toggleLike(extendedVehicle);
  }

  onPopupToggleCompare(vehicle: Vehicle): void {
    const extendedVehicle: ExtendedVehicle = {
      ...vehicle,
      type: 'vehicle' as const
    };
    this.toggleCompare(extendedVehicle);
  }

  addToCart(itemId: string | number): void {
    // First try to find in filtered items (currently displayed items)
    const filteredItem = this.filteredItems.find(item => item.id === itemId);
    if (filteredItem) {
      this.cartService.addToCart(filteredItem);
      console.log(`Added ${filteredItem.type} to cart:`, filteredItem.name);
      return;
    }

    // Fallback: try to find in vehicles
    const vehicle = this.vehicles.find(v => v.id === itemId);
    if (vehicle) {
      this.cartService.addToCart(vehicle);
      console.log('Added vehicle to cart:', vehicle.name);
      return;
    }

    // Fallback: try to find in accessories
    const accessory = this.accessories.find(a => a.id === itemId);
    if (accessory) {
      this.cartService.addToCart(accessory);
      console.log('Added accessory to cart:', accessory.name);
      return;
    }

    console.error('Item not found with ID:', itemId);
  }

  // Utility methods
  getSelectedLabel(): string {
    const selected = this.sortOptions.find(opt => opt.value === this.selectedSortOption);
    return selected ? selected.label : 'Relevance';
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  // TrackBy function for better performance
  trackByVehicleId(index: number, item: DisplayItem): string | number {
    return item.id;
  }

  // Methods to get appropriate filter options based on selected type
  getCurrentCategories(): string[] {
    if (this.selectedTypes.length === 1) {
      if (this.selectedTypes.includes('Vehicles')) {
        return this.vehicleCategories;
      } else if (this.selectedTypes.includes('Accessories')) {
        return this.accessoryCategories;
      }
    }
    // If both types are selected or none, show all categories
    return [...this.vehicleCategories, ...this.accessoryCategories].sort();
  }

  isVehicleFilterVisible(): boolean {
    return this.selectedTypes.includes('Vehicles');
  }

  isAccessoryFilterVisible(): boolean {
    return this.selectedTypes.includes('Accessories');
  }

  // Accessory-specific filter handlers
  onCompatibilityChange(compatibility: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      this.accessoryFilters.compatibility!.push(compatibility);
    } else {
      this.accessoryFilters.compatibility = this.accessoryFilters.compatibility!.filter(c => c !== compatibility);
    }
    this.applyFilters();
  }

  onInstallationTypeChange(type: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      this.accessoryFilters.installationType!.push(type);
    } else {
      this.accessoryFilters.installationType = this.accessoryFilters.installationType!.filter(t => t !== type);
    }
    this.applyFilters();
  }

  onWarrantyChange(warranty: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      this.accessoryFilters.warranty!.push(warranty);
    } else {
      this.accessoryFilters.warranty = this.accessoryFilters.warranty!.filter(w => w !== warranty);
    }
    this.applyFilters();
  }

  onMaterialChange(material: string, event: Event): void {
    const target = event.target as HTMLInputElement;
    const checked = target.checked;

    if (checked) {
      this.accessoryFilters.material!.push(material);
    } else {
      this.accessoryFilters.material = this.accessoryFilters.material!.filter(m => m !== material);
    }
    this.applyFilters();
  }

  // Vehicle-specific filter handlers
  onElectricChange(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.vehicleFilters.isElectric = target.checked;
    this.applyFilters();
  }

  onYearRangeChange(event: any): void {
    this.vehicleFilters.year = event.value;
    this.applyFilters();
  }

  onBatterySizeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      this.vehicleFilters.batterySize = [target.value];
    } else {
      this.vehicleFilters.batterySize = undefined;
    }
    this.applyFilters();
  }

  onChargingTimeChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    if (target.value) {
      // Parse the charging time range (e.g., "18-25" -> [18, 25])
      const parts = target.value.split('-').map(Number);
      if (parts.length === 2) {
        this.vehicleFilters.chargingTime = [parts[0], parts[1]];
      } else {
        // Single value, use as both min and max
        const time = parseInt(target.value);
        this.vehicleFilters.chargingTime = [time, time];
      }
    } else {
      this.vehicleFilters.chargingTime = undefined;
    }
    this.applyFilters();
  }
}
