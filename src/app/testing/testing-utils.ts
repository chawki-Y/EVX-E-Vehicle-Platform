import { ComponentFixture } from '@angular/core/testing';
import { DebugElement } from '@angular/core';
import { By } from '@angular/platform-browser';

/**
 * Testing utilities for Angular components
 */
export class TestingUtils {
  
  /**
   * Get element by test ID
   */
  static getByTestId<T>(fixture: ComponentFixture<T>, testId: string): DebugElement | null {
    return fixture.debugElement.query(By.css(`[data-testid="${testId}"]`));
  }

  /**
   * Get all elements by test ID
   */
  static getAllByTestId<T>(fixture: ComponentFixture<T>, testId: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(`[data-testid="${testId}"]`));
  }

  /**
   * Get element by CSS selector
   */
  static getBySelector<T>(fixture: ComponentFixture<T>, selector: string): DebugElement | null {
    return fixture.debugElement.query(By.css(selector));
  }

  /**
   * Get all elements by CSS selector
   */
  static getAllBySelector<T>(fixture: ComponentFixture<T>, selector: string): DebugElement[] {
    return fixture.debugElement.queryAll(By.css(selector));
  }

  /**
   * Trigger click event on element
   */
  static click(element: DebugElement): void {
    element.nativeElement.click();
  }

  /**
   * Set input value and trigger input event
   */
  static setInputValue(element: DebugElement, value: string): void {
    const input = element.nativeElement;
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  /**
   * Wait for async operations to complete
   */
  static async waitForAsync(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 0));
  }

  /**
   * Mock performance API for testing
   */
  static mockPerformanceAPI(): void {
    if (typeof window !== 'undefined' && !window.performance) {
      (window as any).performance = {
        now: () => Date.now(),
        mark: () => {},
        measure: () => {},
        getEntriesByType: () => [],
        getEntriesByName: () => [],
      };
    }
  }

  /**
   * Mock intersection observer for testing
   */
  static mockIntersectionObserver(): void {
    if (typeof window !== 'undefined' && !window.IntersectionObserver) {
      (window as any).IntersectionObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      };
    }
  }

  /**
   * Create mock user preferences
   */
  static createMockUserPreferences() {
    return {
      theme: 'dark' as const,
      language: 'en',
      notifications: {
        email: true,
        push: false,
        marketing: false,
      },
      accessibility: {
        reducedMotion: false,
        highContrast: false,
        fontSize: 'medium' as const,
      },
    };
  }

  /**
   * Create mock vehicle data
   */
  static createMockVehicle() {
    return {
      id: 'test-vehicle-1',
      name: 'Test Electric Vehicle',
      brand: 'TestBrand',
      model: 'TestModel',
      year: 2024,
      price: 50000,
      range: 400,
      batteryCapacity: 75,
      chargingTime: 30,
      images: ['test-image.jpg'],
      description: 'Test vehicle description',
      specifications: {
        motor: {
          power: 200,
          torque: 400,
          type: 'Permanent Magnet Synchronous',
        },
        battery: {
          capacity: 75,
          type: 'Lithium-ion',
          warranty: '8 years / 160,000 km',
        },
        performance: {
          acceleration: 6.5,
          topSpeed: 180,
          range: 400,
        },
        charging: {
          dcFastCharging: 150,
          acCharging: 11,
          chargingTime: {
            fast: '10-80% in 30 min',
            standard: '0-100% in 8 hours',
          },
        },
        dimensions: {
          length: 4500,
          width: 1800,
          height: 1600,
          wheelbase: 2700,
          weight: 1800,
        },
      },
      isLiked: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }

  /**
   * Create mock API response
   */
  static createMockApiResponse<T>(data: T, success = true) {
    return {
      data,
      message: success ? 'Success' : 'Error',
      success,
      timestamp: new Date().toISOString(),
    };
  }
}