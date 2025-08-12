import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingConfig {
  message?: string;
  logoUrl?: string;
  logoAlt?: string;
  showText?: boolean;
  spinning?: boolean;
  fullscreen?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private loadingConfigSubject = new BehaviorSubject<LoadingConfig>({
    message: 'Loading...',
    logoUrl: 'assets/images/logo.png',
    logoAlt: 'Loading...',
    showText: true,
    spinning: false,
    fullscreen: true
  });

  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  public loadingConfig$: Observable<LoadingConfig> = this.loadingConfigSubject.asObservable();

  /**
   * Show loading with default configuration
   */
  show(): void {
    this.isLoadingSubject.next(true);
  }

  /**
   * Show loading with custom configuration
   */
  showWithConfig(config: LoadingConfig): void {
    this.loadingConfigSubject.next({
      ...this.loadingConfigSubject.value,
      ...config
    });
    this.isLoadingSubject.next(true);
  }

  /**
   * Hide loading
   */
  hide(): void {
    this.isLoadingSubject.next(false);
  }

  /**
   * Show loading with a specific message
   */
  showWithMessage(message: string): void {
    this.showWithConfig({ message });
  }

  /**
   * Show loading with spinning logo
   */
  showWithSpinning(spinning: boolean = true): void {
    this.showWithConfig({ spinning });
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }

  /**
   * Get current loading configuration
   */
  get loadingConfig(): LoadingConfig {
    return this.loadingConfigSubject.value;
  }

  /**
   * Set default loading configuration
   */
  setDefaultConfig(config: LoadingConfig): void {
    this.loadingConfigSubject.next({
      ...this.loadingConfigSubject.value,
      ...config
    });
  }
} 