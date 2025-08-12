import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="loading-overlay" [class.fullscreen]="fullscreen">
      <div class="loading-container">
        <div class="logo-container">
          <img 
            [src]="logoUrl" 
            [alt]="logoAlt" 
            class="loading-logo"
            [class.spinning]="spinning"
          />
        </div>
        <div class="loading-text" *ngIf="showText">
          <p class="loading-message">{{ message }}</p>
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .loading-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
      transition: opacity 0.3s ease-in-out;
    }

    .loading-overlay.fullscreen {
      position: fixed;
    }

    .loading-container {
      text-align: center;
      color: white;
    }

    .logo-container {
      margin-bottom: 2rem;
    }

    .loading-logo {
      width: 120px;
      height: 120px;
      object-fit: contain;
      border-radius: 50%;
      background: rgba(255, 255, 255, 0.1);
      padding: 1rem;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255, 255, 255, 0.2);
      transition: transform 0.3s ease;
    }

    .loading-logo:hover {
      transform: scale(1.05);
    }

    .loading-logo.spinning {
      animation: spin 2s linear infinite;
    }

    @keyframes spin {
      from {
        transform: rotate(0deg);
      }
      to {
        transform: rotate(360deg);
      }
    }

    .loading-text {
      margin-top: 1rem;
    }

    .loading-message {
      font-size: 1.2rem;
      font-weight: 500;
      margin-bottom: 1rem;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      margin-top: 1rem;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-top: 4px solid white;
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    /* Responsive design */
    @media (max-width: 768px) {
      .loading-logo {
        width: 80px;
        height: 80px;
      }

      .loading-message {
        font-size: 1rem;
      }

      .spinner {
        width: 30px;
        height: 30px;
      }
    }

    /* Dark mode support */
    @media (prefers-color-scheme: dark) {
      .loading-overlay {
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      }
    }
  `]
})
export class LoadingComponent {
  @Input() logoUrl: string = 'assets/images/logo.png';
  @Input() logoAlt: string = 'Loading...';
  @Input() message: string = 'Loading...';
  @Input() showText: boolean = true;
  @Input() spinning: boolean = false;
  @Input() fullscreen: boolean = true;
} 