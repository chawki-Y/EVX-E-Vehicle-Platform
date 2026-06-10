import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Vehicle } from '../../services/vehicle.service';

@Component({
  selector: 'app-vehicle-comparison',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-comparison.component.html',
  styleUrl: './vehicle-comparison.component.css'
})
export class VehicleComparisonComponent implements OnInit {
  @Input() isVisible: boolean = false;
  @Input() comparedVehicles: Vehicle[] = [];
  @Output() close = new EventEmitter<void>();
  @Output() removeVehicle = new EventEmitter<Vehicle>();
  @Output() addToCart = new EventEmitter<number>();
  @Output() toggleLike = new EventEmitter<Vehicle>();

  ngOnInit(): void {
    // Ensure we only have maximum 2 vehicles for comparison
    if (this.comparedVehicles.length > 2) {
      this.comparedVehicles = this.comparedVehicles.slice(0, 2);
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onAddToCart(vehicleId: number): void {
    this.addToCart.emit(vehicleId);
  }

  onToggleLike(vehicle: Vehicle): void {
    this.toggleLike.emit(vehicle);
  }

  getComparisonData(): any[] {
    const comparisonFields = [
      { label: 'Price', key: 'price', type: 'currency' },
      { label: 'Range', key: 'range', type: 'text', suffix: ' miles' },
      { label: 'Year', key: 'year', type: 'text' },
      { label: 'Condition', key: 'condition', type: 'text' },
      { label: 'Category', key: 'category', type: 'text' },
      { label: 'Rating', key: 'rating', type: 'rating' },
      { label: 'Reviews', key: 'reviews', type: 'text' },
      { label: 'Battery Size', key: 'batterySize', type: 'text' },
      { label: 'Charging Time', key: 'chargingTime', type: 'text' },
      { label: 'Features', key: 'features', type: 'list' }
    ];

    return comparisonFields;
  }

  formatValue(vehicle: Vehicle, field: any): string {
    const value = (vehicle as any)[field.key];
    
    switch (field.type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: 0
        }).format(value);
      case 'rating':
        return `${value}/5`;
      case 'list':
        return Array.isArray(value) ? value.join(', ') : value || 'N/A';
      case 'text':
        return value ? `${value}${field.suffix || ''}` : 'N/A';
      default:
        return value || 'N/A';
    }
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  getBetterValue(field: any, vehicle1: Vehicle, vehicle2: Vehicle): 'vehicle1' | 'vehicle2' | 'equal' {
    if (!vehicle1 || !vehicle2) return 'equal';
    
    const value1 = (vehicle1 as any)[field.key];
    const value2 = (vehicle2 as any)[field.key];
    
    if (value1 === value2) return 'equal';
    
    // For these fields, higher is better
    if (['range', 'rating', 'year'].includes(field.key)) {
      return value1 > value2 ? 'vehicle1' : 'vehicle2';
    }
    
    // For price, lower is better
    if (field.key === 'price') {
      return value1 < value2 ? 'vehicle1' : 'vehicle2';
    }
    
    return 'equal';
  }
}