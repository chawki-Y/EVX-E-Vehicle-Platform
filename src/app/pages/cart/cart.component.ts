import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { CartService } from '../../services/cart.service';
import { LikesService } from '../../services/likes.service';
import { FooterComponent } from '../../components/footer/footer.component';

interface CartItem {
  id: string | number;
  name: string;
  brand: string;
  price: number;
  image: string;
  quantity: number;
}

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, FooterComponent],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.css'
})
export class CartComponent implements OnInit, OnDestroy {
  cartItems: CartItem[] = [];
  private cartSubscription?: Subscription;

  constructor(
    private cartService: CartService,
    private likesService: LikesService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.cartSubscription = this.cartService.cart$.subscribe(items => {
      this.cartItems = items;
    });
  }

  ngOnDestroy(): void {
    if (this.cartSubscription) {
      this.cartSubscription.unsubscribe();
    }
  }

  updateQuantity(itemId: string | number, newQuantity: number): void {
    if (newQuantity > 0) {
      this.cartService.updateQuantity(itemId, newQuantity);
    }
  }

  increaseQuantity(itemId: string | number): void {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item) {
      this.cartService.updateQuantity(itemId, item.quantity + 1);
    }
  }

  decreaseQuantity(itemId: string | number): void {
    const item = this.cartItems.find(item => item.id === itemId);
    if (item && item.quantity > 1) {
      this.cartService.updateQuantity(itemId, item.quantity - 1);
    }
  }

  removeFromCart(itemId: string | number): void {
    this.cartService.removeFromCart(itemId);
  }

  addToLikes(item: CartItem): void {
    this.likesService.addToLikes(item);
  }

  viewDetails(itemId: string | number): void {
    this.router.navigate(['/advanced-search'], { queryParams: { itemId } });
  }

  clearCart(): void {
    if (confirm('Are you sure you want to remove all items from your cart?')) {
      this.cartService.clearCart();
    }
  }

  getSubtotal(): number {
    return this.cartService.getCartTotal();
  }

  getTax(): number {
    return this.getSubtotal() * 0.08; // 8% tax
  }

  getShipping(): number {
    return this.getSubtotal() > 50000 ? 0 : 500; // Free shipping over $50k
  }

  getTotal(): number {
    return this.getSubtotal() + this.getTax() + this.getShipping();
  }

  getTotalItems(): number {
    return this.cartService.getCartCount();
  }

  proceedToCheckout(): void {
    if (this.cartItems.length === 0) {
      alert('Your cart is empty!');
      return;
    }
    // TODO: Implement checkout functionality
    alert('Checkout functionality will be implemented soon!');
  }

  continueShopping(): void {
    this.router.navigate(['/advanced-search']);
  }

  goBack(): void {
    this.router.navigate(['/advanced-search']);
  }
}