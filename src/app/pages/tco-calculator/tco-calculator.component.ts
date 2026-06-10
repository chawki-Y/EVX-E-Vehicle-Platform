import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, ChangeDetectorRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SliderModule } from 'primeng/slider';
import { InputTextModule } from 'primeng/inputtext';
import { FooterComponent } from '../../components/footer/footer.component';
import { VehicleService, Vehicle } from '../../services/vehicle.service';
import { Subject, takeUntil } from 'rxjs';

interface TCOCalculation {
  vehiclePrice: number;
  downPayment: number;
  loanTerm: number;
  interestRate: number;
  insuranceCost: number;
  maintenanceCost: number;
  fuelCost: number;
  electricityCost: number;
  milesPerYear: number;
  totalCost: number;
  monthlyCost: number;
  fuelSavings: number;
  maintenanceSavings: number;
  totalSavings: number;
}

interface ComparisonVehicle {
  id: string;
  name: string;
  price: number;
  isElectric: boolean;
  mpg?: number;
  mpge?: number;
  range?: number;
  image?: string;
}

@Component({
  selector: 'app-tco-calculator',
  standalone: true,
  imports: [CommonModule, FormsModule, SliderModule, InputTextModule, FooterComponent],
  templateUrl: './tco-calculator.component.html',
  styleUrl: './tco-calculator.component.css'
})
export class TcoCalculatorComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  
  // Hero vehicles for slideshow
  heroVehicles: Vehicle[] = [];
  currentSlide: number = 0;
  
  // Calculator inputs for EV
  evPrice: number = 45000;
  evDownPayment: number = 9000;
  evLoanTerm: number = 60;
  evInterestRate: number = 3.5;
  evInsurance: number = 1200;
  evMaintenance: number = 500;
  evElectricityCost: number = 0.12;
  evMilesPerYear: number = 12000;
  evEfficiency: number = 3.5; // miles per kWh

  // Calculator inputs for ICE
  icePrice: number = 35000;
  iceDownPayment: number = 7000;
  iceLoanTerm: number = 60;
  iceInterestRate: number = 4.0;
  iceInsurance: number = 1400;
  iceMaintenance: number = 1200;
  iceFuelCost: number = 3.50;
  iceMilesPerYear: number = 12000;
  iceMpg: number = 28; // miles per gallon

  // Dynamic market data
  marketData = {
    avgElectricityRate: 0.12,
    avgGasPrice: 3.50,
    evIncentives: 7500,
    iceDepreciationRate: 0.15,
    evDepreciationRate: 0.12
  };
  
  // Calculated results
  evCalculation: TCOCalculation = {} as TCOCalculation;
  iceCalculation: TCOCalculation = {} as TCOCalculation;
  evTotalCost: number = 0;
  iceTotalCost: number = 0;
  totalSavings: number = 0;
  monthlySavings: number = 0;
  paybackPeriod: number = 0; // months
  
  // Detailed cost breakdowns
  evCostBreakdown = {
    purchase: 0,
    financing: 0,
    insurance: 0,
    maintenance: 0,
    energy: 0,
    depreciation: 0,
    incentives: 0
  };
  
  iceCostBreakdown = {
    purchase: 0,
    financing: 0,
    insurance: 0,
    maintenance: 0,
    fuel: 0,
    depreciation: 0
  };
  
  // Dynamic updates
  isCalculating: boolean = false;
  lastUpdated: Date = new Date();
  
  // UI state
  isMobile: boolean = false;
  activeTab: string = 'calculator';
  
  // Slider ranges
  priceRange: number[] = [20000, 80000];
  downPaymentRange: number[] = [0, 20000];
  loanTermRange: number[] = [24, 84];
  interestRateRange: number[] = [1, 10];
  milesRange: number[] = [5000, 25000];
  
  constructor(
    private vehicleService: VehicleService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }
  
  ngOnInit(): void {
    this.checkMobileScreen();
    this.calculateTCO();
    
    // Only load data in browser environment to prevent SSR issues
    if (isPlatformBrowser(this.platformId)) {
      this.loadHeroVehicles();
      this.startHeroCarousel();
      
      // Listen for window resize
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
  
  private onWindowResize = () => {
    this.checkMobileScreen();
  };
  
  private checkMobileScreen(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.isMobile = window.innerWidth <= 768;
      this.cdr.detectChanges();
    }
  }
  
  private loadHeroVehicles(): void {
    this.vehicleService.getVehicles({}, 'name_asc', 1, 5).subscribe({
      next: (response) => {
        if (response && response.data) {
          this.heroVehicles = response.data.slice(0, 5);
          this.startHeroCarousel();
        }
      },
      error: (error) => {
        console.error('Error loading hero vehicles:', error);
      }
    });
  }
  
  startHeroCarousel(): void {
    setInterval(() => this.nextSlide(), 5000);
  }
  
  nextSlide(): void {
    this.currentSlide = (this.currentSlide + 1) % this.heroVehicles.length;
  }
  
  prevSlide(): void {
    this.currentSlide = this.currentSlide === 0 ? this.heroVehicles.length - 1 : this.currentSlide - 1;
  }
  
  getCurrentHeroVehicle(): Vehicle | undefined {
    if (this.heroVehicles.length > 0) {
      return this.heroVehicles[this.currentSlide];
    }
    return undefined;
  }
  
  calculateTCO(): void {
    this.isCalculating = true;
    
    // Simulate real-time calculation delay
    setTimeout(() => {
      const years = 5;
      const months = years * 12;
      
      // EV Calculations
      this.calculateEVCosts(years, months);
      
      // ICE Calculations
      this.calculateICECosts(years, months);
      
      // Comparison calculations
      this.totalSavings = this.iceTotalCost - this.evTotalCost;
      this.monthlySavings = this.totalSavings / months;
      
      // Dynamic payback period calculation
      this.calculatePaybackPeriod();
      
      this.lastUpdated = new Date();
      this.isCalculating = false;
    }, 500);
  }
  
  private calculateEVCosts(years: number, months: number): void {
    // Purchase and financing
    const evLoanAmount = this.evPrice - this.evDownPayment;
    const evMonthlyPayment = this.calculateMonthlyPayment(evLoanAmount, this.evInterestRate, this.evLoanTerm);
    const evTotalFinancing = evMonthlyPayment * this.evLoanTerm;
    
    // Energy costs (electricity)
    const annualKwh = this.evMilesPerYear / this.evEfficiency;
    const annualElectricityCost = annualKwh * this.evElectricityCost;
    
    // Depreciation
    const evDepreciation = this.evPrice * this.marketData.evDepreciationRate * years;
    
    // Cost breakdown
    this.evCostBreakdown = {
      purchase: this.evPrice,
      financing: evTotalFinancing - evLoanAmount,
      insurance: this.evInsurance * years,
      maintenance: this.evMaintenance * years,
      energy: annualElectricityCost * years,
      depreciation: evDepreciation,
      incentives: -this.marketData.evIncentives
    };
    
    this.evTotalCost = Object.values(this.evCostBreakdown).reduce((sum, cost) => sum + cost, 0);
  }
  
  private calculateICECosts(years: number, months: number): void {
    // Purchase and financing
    const iceLoanAmount = this.icePrice - this.iceDownPayment;
    const iceMonthlyPayment = this.calculateMonthlyPayment(iceLoanAmount, this.iceInterestRate, this.iceLoanTerm);
    const iceTotalFinancing = iceMonthlyPayment * this.iceLoanTerm;
    
    // Fuel costs
    const annualGallons = this.iceMilesPerYear / this.iceMpg;
    const annualFuelCost = annualGallons * this.iceFuelCost;
    
    // Depreciation
    const iceDepreciation = this.icePrice * this.marketData.iceDepreciationRate * years;
    
    // Cost breakdown
    this.iceCostBreakdown = {
      purchase: this.icePrice,
      financing: iceTotalFinancing - iceLoanAmount,
      insurance: this.iceInsurance * years,
      maintenance: this.iceMaintenance * years,
      fuel: annualFuelCost * years,
      depreciation: iceDepreciation
    };
    
    this.iceTotalCost = Object.values(this.iceCostBreakdown).reduce((sum, cost) => sum + cost, 0);
  }
  
  private calculateMonthlyPayment(principal: number, annualRate: number, months: number): number {
    const monthlyRate = annualRate / 100 / 12;
    if (monthlyRate === 0) return principal / months;
    
    return principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / 
           (Math.pow(1 + monthlyRate, months) - 1);
  }
  
  private calculatePaybackPeriod(): void {
    const priceDifference = this.evPrice - this.icePrice;
    const annualEvOperating = this.evInsurance + this.evMaintenance + (this.evMilesPerYear / this.evEfficiency * this.evElectricityCost);
    const annualIceOperating = this.iceInsurance + this.iceMaintenance + (this.iceMilesPerYear / this.iceMpg * this.iceFuelCost);
    const monthlyOperationalSavings = (annualIceOperating - annualEvOperating) / 12;
    
    if (monthlyOperationalSavings > 0) {
      this.paybackPeriod = Math.max(0, priceDifference / monthlyOperationalSavings);
    } else {
      this.paybackPeriod = 0;
    }
  }
  
  private calculateVehicleTCO(params: any): TCOCalculation {
    const loanAmount = params.vehiclePrice - params.downPayment;
    const monthlyInterestRate = params.interestRate / 100 / 12;
    const monthlyPayment = loanAmount * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, params.loanTerm)) / 
                          (Math.pow(1 + monthlyInterestRate, params.loanTerm) - 1);
    
    const totalLoanPayments = monthlyPayment * params.loanTerm;
    const totalInsurance = params.insuranceCost * (params.loanTerm / 12);
    const totalMaintenance = params.maintenanceCost * (params.loanTerm / 12);
    const totalFuel = params.fuelCost * (params.loanTerm / 12);
    
    const totalCost = params.downPayment + totalLoanPayments + totalInsurance + totalMaintenance + totalFuel;
    const monthlyCost = totalCost / params.loanTerm;
    
    return {
      vehiclePrice: params.vehiclePrice,
      downPayment: params.downPayment,
      loanTerm: params.loanTerm,
      interestRate: params.interestRate,
      insuranceCost: params.insuranceCost,
      maintenanceCost: params.maintenanceCost,
      fuelCost: params.fuelCost,
      electricityCost: 0,
      milesPerYear: params.milesPerYear,
      totalCost: totalCost,
      monthlyCost: monthlyCost,
      fuelSavings: 0,
      maintenanceSavings: 0,
      totalSavings: 0
    };
  }
  
  // Legacy change handlers removed - using dynamic onInputChange with debouncing
  
  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }
  
  onInputChange(): void {
    // Debounce calculations for better performance
    clearTimeout(this.calculationTimeout);
    this.calculationTimeout = setTimeout(() => {
      this.calculateTCO();
    }, 300);
  }
  
  private calculationTimeout: any;
  
  // Dynamic market data updates
  updateMarketData(): void {
    // Simulate fetching real-time market data
    this.marketData = {
      avgElectricityRate: this.getRandomInRange(0.08, 0.18),
      avgGasPrice: this.getRandomInRange(3.00, 4.50),
      evIncentives: this.getRandomInRange(5000, 10000),
      iceDepreciationRate: this.getRandomInRange(0.12, 0.18),
      evDepreciationRate: this.getRandomInRange(0.08, 0.15)
    };
    
    // Update electricity and fuel costs based on market data
    this.evElectricityCost = this.marketData.avgElectricityRate;
    this.iceFuelCost = this.marketData.avgGasPrice;
    
    this.calculateTCO();
  }
  
  private getRandomInRange(min: number, max: number): number {
    return Math.round((Math.random() * (max - min) + min) * 100) / 100;
  }
  
  // Load vehicle presets
  loadVehiclePreset(type: 'economy' | 'luxury' | 'suv'): void {
    const presets = {
      economy: {
        ev: { price: 32000, efficiency: 4.2, maintenance: 400 },
        ice: { price: 25000, mpg: 32, maintenance: 1000 }
      },
      luxury: {
        ev: { price: 85000, efficiency: 3.0, maintenance: 800 },
        ice: { price: 75000, mpg: 22, maintenance: 1800 }
      },
      suv: {
        ev: { price: 55000, efficiency: 2.8, maintenance: 600 },
        ice: { price: 45000, mpg: 25, maintenance: 1400 }
      }
    };
    
    const preset = presets[type];
    this.evPrice = preset.ev.price;
    this.evEfficiency = preset.ev.efficiency;
    this.evMaintenance = preset.ev.maintenance;
    
    this.icePrice = preset.ice.price;
    this.iceMpg = preset.ice.mpg;
    this.iceMaintenance = preset.ice.maintenance;
    
    this.calculateTCO();
  }

  resetCalculator(): void {
    this.evPrice = 45000;
    this.evDownPayment = 9000;
    this.evLoanTerm = 60;
    this.evInterestRate = 3.5;
    this.evInsurance = 1200;
    this.evMaintenance = 500;
    this.evElectricityCost = 0.12;
    this.evMilesPerYear = 12000;
    this.evEfficiency = 3.5;
    
    this.icePrice = 35000;
    this.iceDownPayment = 7000;
    this.iceLoanTerm = 60;
    this.iceInterestRate = 4.0;
    this.iceInsurance = 1400;
    this.iceMaintenance = 1200;
    this.iceFuelCost = 3.50;
    this.iceMilesPerYear = 12000;
    this.iceMpg = 28;
    
    this.calculateTCO();
  }
  
  getSavingsPercentage(): number {
    if (this.iceCalculation.totalCost === 0) return 0;
    return (this.evCalculation.totalSavings / this.iceCalculation.totalCost) * 100;
  }
  
  getPaybackPeriod(): number {
    return this.paybackPeriod;
  }
}