import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { LoadingComponent } from '../loading/loading.component';
import { LoadingService, LoadingConfig } from '../../../core/services/loading.service';

@Component({
  selector: 'app-global-loading',
  standalone: true,
  imports: [CommonModule, LoadingComponent],
  template: `
    <app-loading
      *ngIf="isLoading"
      [logoUrl]="loadingConfig.logoUrl || 'assets/images/logo.png'"
      [logoAlt]="loadingConfig.logoAlt || 'Loading...'"
      [message]="loadingConfig.message || 'Loading...'"
      [showText]="loadingConfig.showText ?? true"
      [spinning]="loadingConfig.spinning ?? false"
      [fullscreen]="loadingConfig.fullscreen ?? true"
    ></app-loading>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class GlobalLoadingComponent implements OnInit, OnDestroy {
  isLoading: boolean = false;
  loadingConfig: LoadingConfig = {
    message: 'Loading...',
    logoUrl: 'assets/images/logo.png',
    logoAlt: 'Loading...',
    showText: true,
    spinning: false,
    fullscreen: true
  };

  private subscriptions: Subscription[] = [];

  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    // Subscribe to loading state changes
    this.subscriptions.push(
      this.loadingService.isLoading$.subscribe(
        (isLoading) => {
          this.isLoading = isLoading;
        }
      )
    );

    // Subscribe to loading configuration changes
    this.subscriptions.push(
      this.loadingService.loadingConfig$.subscribe(
        (config) => {
          this.loadingConfig = config;
        }
      )
    );
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
} 