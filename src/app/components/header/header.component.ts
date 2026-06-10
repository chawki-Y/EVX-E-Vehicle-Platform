import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { LikesService } from '../../services/likes.service';
import { CartService } from '../../services/cart.service';
import { OptimizeImageDirective } from '../../directives/optimize-image.directive';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [CommonModule, OptimizeImageDirective],
  templateUrl: './header.component.html',
  styleUrl: './header.component.css'
})
export class HeaderComponent implements OnInit, OnDestroy {
  @Input() f: number = 1; // Default value is 1 (show default buttons)
  likesCount: number = 0;
  cartCount: number = 0;
  private likesSubscription?: Subscription;
  private cartSubscription?: Subscription;

  constructor(
    private router: Router,
    private likesService: LikesService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.likesSubscription = this.likesService.likes$.subscribe(likes => {
      this.likesCount = likes.length;
    });
    
    this.cartSubscription = this.cartService.cart$.subscribe(cartItems => {
      this.cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
    });
  }

  ngOnDestroy(): void {
    if (this.likesSubscription) {
      this.likesSubscription.unsubscribe();
    }
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  navigateToHomePage(): void {
    this.router.navigate(['/']);
  }

  navigateToLikes(): void {
    this.router.navigate(['/likes']);
  }

  navigateToCart(): void {
    this.router.navigate(['/cart']);
  }

  navigateToTcoCalculator(): void {
    this.router.navigate(['/tco-calculator']);
  }
}
