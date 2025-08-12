import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterModule, CommonModule],
    template: `
        <!-- Loading Overlay -->
        <div class="loading-overlay" *ngIf="isLoading">
            <div class="loading-container">
                <div class="logo-container">
                    <div class="loading-logo">
                        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="60" cy="60" r="50" stroke="rgba(255,255,255,0.3)" stroke-width="4" fill="none"/>
                            <circle cx="60" cy="60" r="50" stroke="white" stroke-width="4" fill="none" 
                                    stroke-dasharray="314" stroke-dashoffset="314"
                                    [style.stroke-dashoffset]="strokeDashoffset">
                                <animate attributeName="stroke-dashoffset" 
                                         values="314;0;314" 
                                         dur="2s" 
                                         repeatCount="indefinite"/>
                            </circle>
                            <text x="60" y="65" text-anchor="middle" fill="white" font-size="24" font-weight="bold">LOGO</text>
                        </svg>
                    </div>
                </div>
                <div class="loading-text">
                    <p class="loading-message">{{ loadingMessage }}</p>
                    <div class="loading-spinner">
                        <div class="spinner"></div>
                    </div>
                </div>
            </div>
        </div>
        
        <router-outlet></router-outlet>
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
            margin: 0 auto;
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

        @keyframes spin {
            from {
                transform: rotate(0deg);
            }
            to {
                transform: rotate(360deg);
            }
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
export class AppComponent {
    isLoading: boolean = true;
    loadingMessage: string = 'Initializing application...';
    strokeDashoffset: number = 314;

    constructor() {
        // Show initial loading for 2 seconds
        setTimeout(() => {
            this.isLoading = false;
        }, 2000);
    }

    // Method to show loading (can be called from other components)
    showLoading(message: string = 'Loading...') {
        this.loadingMessage = message;
        this.isLoading = true;
    }

    // Method to hide loading
    hideLoading() {
        this.isLoading = false;
    }
}
