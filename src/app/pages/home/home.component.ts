import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FooterComponent } from '../../components/footer/footer.component';
import { HeroSectionComponent } from '../../components/hero-section/hero-section.component';

interface FeaturedVehicle {
  id: number;
  name: string;
  brand: string;
  price: number;
  originalPrice?: number;
  image: string;
  range: number;
  year: number;
  rating: number;
  reviews: number;
  isLiked: boolean;
  badge?: string;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, HeroSectionComponent, FooterComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class HomeComponent {
  readonly featuredVehicles: FeaturedVehicle[] = [
    {
      id: 1,
      name: 'Renault Scenic E-Tech',
      brand: 'Renault',
      price: 42500,
      originalPrice: 45000,
      image: 'assets/vehicles/renault-scenic.jpg',
      range: 379,
      year: 2025,
      rating: 4.8,
      reviews: 156,
      isLiked: false,
      badge: 'NEW ARRIVAL'
    },
    {
      id: 2,
      name: 'Hyundai IONIQ 6',
      brand: 'Hyundai',
      price: 48900,
      image: 'assets/vehicles/hyundai-ioniq-6.jpg',
      range: 425,
      year: 2024,
      rating: 4.9,
      reviews: 203,
      isLiked: false,
      badge: 'BEST SELLER'
    },
    {
      id: 3,
      name: 'Tesla Model 3',
      brand: 'Tesla',
      price: 39990,
      image: 'assets/vehicles/tesla-model-3.jpg',
      range: 358,
      year: 2024,
      rating: 4.7,
      reviews: 892,
      isLiked: false,
      badge: 'POPULAR'
    }
  ];

  getStars(rating: number): number[] {
    return Array(Math.floor(rating)).fill(0);
  }

  toggleLike(vehicle: FeaturedVehicle): void {
    vehicle.isLiked = !vehicle.isLiked;
  }

  handleImageError(event: Event): void {
    const image = event.target as HTMLImageElement;
    image.src = 'assets/vehicles/renault-scenic.jpg';
  }
}
