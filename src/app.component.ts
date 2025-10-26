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
                        <img src="images/logo.png" alt="Pledge Logo" class="loading-logo-image">
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
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.2);
            transition: transform 0.3s ease;
            padding: 1rem;
        }
        // .loading-logo animation border
        .loading-logo::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            border: 2px solid #667eea;
            border-top: 2px solid white;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        }

        .loading-logo-image {
            width: 100%;
            height: 100%;
            object-fit: contain;
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

    constructor() {
        // Show initial loading for 2 seconds
        setTimeout(() => {
            this.isLoading = false;
        }, 2000);
    }

    // Method to show loading (can be called from other components)
    showLoading() {
        this.isLoading = true;
    }

    // Method to hide loading
    hideLoading() {
        this.isLoading = false;
    }
}
