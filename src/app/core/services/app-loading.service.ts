import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AppLoadingService {
  private isLoadingSubject = new BehaviorSubject<boolean>(false);
  private loadingMessageSubject = new BehaviorSubject<string>('Loading...');

  public isLoading$: Observable<boolean> = this.isLoadingSubject.asObservable();
  public loadingMessage$: Observable<string> = this.loadingMessageSubject.asObservable();

  /**
   * Show loading with default message
   */
  show(): void {
    this.isLoadingSubject.next(true);
  }

  /**
   * Show loading with custom message
   */
  showWithMessage(message: string): void {
    this.loadingMessageSubject.next(message);
    this.isLoadingSubject.next(true);
  }

  /**
   * Hide loading
   */
  hide(): void {
    this.isLoadingSubject.next(false);
  }

  /**
   * Get current loading state
   */
  get isLoading(): boolean {
    return this.isLoadingSubject.value;
  }

  /**
   * Get current loading message
   */
  get loadingMessage(): string {
    return this.loadingMessageSubject.value;
  }
} 