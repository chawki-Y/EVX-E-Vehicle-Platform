import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LikesService } from '../../services/likes.service';
import { CartService } from '../../services/cart.service';
import { FooterComponent } from '../../components/footer/footer.component';

interface LikedItem {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  image: string;
  range?: number;
  year?: number;
  condition?: 'new' | 'used';
  category: string;
  rating: number;
  reviews?: number;
  dateAdded: Date;
  type?: 'vehicle' | 'accessory';
}

@Component({
  selector: 'app-likes',
  standalone: true,
  imports: [CommonModule, FooterComponent],
  templateUrl: './likes.component.html',
  styleUrl: './likes.component.css'
})
export class LikesComponent implements OnInit, OnDestroy {
  likedItems: LikedItem[] = [];
  sortBy: string = 'dateAdded';
  sortOrder: 'asc' | 'desc' = 'desc';
  private likesSubscription?: Subscription;

  constructor(
    private likesService: LikesService,
    private cartService: CartService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.likesSubscription = this.likesService.likes$.subscribe(likes => {
      this.likedItems = likes;
      this.applySorting();
    });
  }

  ngOnDestroy(): void {
    if (this.likesSubscription) {
      this.likesSubscription.unsubscribe();
    }
  }

  removeFromLikes(item: LikedItem): void {
    this.likesService.removeFromLikes(item.id, item.type);
  }

  addToCart(item: LikedItem): void {
    this.cartService.addToCart(item);
  }

  viewDetails(item: LikedItem): void {
    // Navigate to item details based on type
    if (item.type === 'vehicle') {
      this.router.navigate(['/product', 'vehicle', item.id]);
    } else {
      this.router.navigate(['/product', 'accessory', item.id]);
    }
  }

  onSortChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const [sortBy, sortOrder] = target.value.split('-');
    this.sortBy = sortBy;
    this.sortOrder = sortOrder as 'asc' | 'desc';
    this.applySorting();
  }

  private applySorting(): void {
    switch (this.sortBy) {
      case 'dateAdded':
        this.likedItems = this.likesService.sortLikesByDate(this.sortOrder === 'asc');
        break;
      case 'price':
        this.likedItems = this.likesService.sortLikesByPrice(this.sortOrder === 'asc');
        break;
      case 'rating':
        this.likedItems = this.likesService.sortLikesByRating(this.sortOrder === 'asc');
        break;
      case 'name':
        this.likedItems = [...this.likedItems].sort((a, b) => {
          const comparison = a.name.localeCompare(b.name);
          return this.sortOrder === 'asc' ? comparison : -comparison;
        });
        break;
    }
  }

  clearAllLikes(): void {
    if (confirm('Are you sure you want to remove all liked items?')) {
      this.likesService.clearLikes();
    }
  }

  getStarArray(rating: number): boolean[] {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(i <= Math.floor(rating));
    }
    return stars;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  goBack(): void {
    this.router.navigate(['/advanced-search']);
  }
}