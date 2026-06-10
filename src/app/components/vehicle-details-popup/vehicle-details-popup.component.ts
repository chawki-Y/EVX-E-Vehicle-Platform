import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Dealer {
  name: string;
  location: string;
  phone: string;
  email: string;
  rating: number;
  verified: boolean;
}

interface Vehicle {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  range: number;
  year: number;
  condition: 'new' | 'used';
  category: string;
  rating: number;
  reviews: number;
  isLiked: boolean;
  isCompared: boolean;
  isElectric?: boolean;
  badge?: string;
  features: string[];
  batterySize: string;
  chargingTime: string;
  dealer: Dealer;
}

@Component({
  selector: 'app-vehicle-details-popup',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vehicle-details-popup.component.html',
  styleUrl: './vehicle-details-popup.component.css'
})
export class VehicleDetailsPopupComponent {
  @Input() vehicle: Vehicle | null = null;
  @Input() isVisible: boolean = false;
  @Output() closePopup = new EventEmitter<void>();
  @Output() addToCart = new EventEmitter<number>();
  @Output() toggleLike = new EventEmitter<Vehicle>();
  @Output() toggleCompare = new EventEmitter<Vehicle>();

  onClose(): void {
    this.closePopup.emit();
  }

  onAddToCart(): void {
    if (this.vehicle) {
      this.addToCart.emit(this.vehicle.id);
    }
  }

  onToggleLike(): void {
    if (this.vehicle) {
      this.toggleLike.emit(this.vehicle);
    }
  }

  onToggleCompare(): void {
    if (this.vehicle) {
      this.toggleCompare.emit(this.vehicle);
    }
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  onBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }
}