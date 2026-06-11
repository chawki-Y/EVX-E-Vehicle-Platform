import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class UserContextService {
  private readonly storageKey = 'evx_guest_user_id';
  private readonly userId: number;

  constructor(@Inject(PLATFORM_ID) platformId: Object) {
    if (!isPlatformBrowser(platformId)) {
      this.userId = 1;
      return;
    }

    const savedId = Number.parseInt(localStorage.getItem(this.storageKey) || '', 10);
    if (Number.isInteger(savedId) && savedId > 0) {
      this.userId = savedId;
      return;
    }

    this.userId = Math.floor(Math.random() * 2_000_000_000) + 1;
    localStorage.setItem(this.storageKey, String(this.userId));
  }

  getUserId(): number {
    return this.userId;
  }
}
