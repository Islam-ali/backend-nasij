import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';

@Component({
  selector: 'app-loading-demo',
  standalone: true,
  imports: [CommonModule, ButtonModule, CardModule],
  template: `
    <div class="loading-demo">
      <p-card header="Loading Demo" styleClass="w-full max-w-2xl mx-auto">
        <div class="flex flex-column gap-4">
          <div class="text-center">
            <h3 class="text-xl font-semibold mb-4">Loading Component Demo</h3>
            <p class="text-gray-600 mb-6">
              This demo shows how to use the loading component with different configurations.
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="flex flex-column gap-2">
              <p-button 
                label="Show Loading (2s)" 
                icon="pi pi-spin pi-spinner"
                (click)="showLoading()"
                severity="primary"
              ></p-button>
              
              <p-button 
                label="Show Loading with Message" 
                icon="pi pi-info-circle"
                (click)="showLoadingWithMessage()"
                severity="info"
              ></p-button>
              
              <p-button 
                label="Show Long Loading (5s)" 
                icon="pi pi-clock"
                (click)="showLongLoading()"
                severity="warn"
              ></p-button>
            </div>

            <div class="flex flex-column gap-2">
              <p-button 
                label="Hide Loading" 
                icon="pi pi-times"
                (click)="hideLoading()"
                severity="danger"
              ></p-button>
              
              <p-button 
                label="Simulate API Call" 
                icon="pi pi-cloud"
                (click)="simulateApiCall()"
                severity="success"
              ></p-button>
              
              <p-button 
                label="Show Error Loading" 
                icon="pi pi-exclamation-triangle"
                (click)="showErrorLoading()"
                severity="secondary"
              ></p-button>
            </div>
          </div>

          <div class="mt-6 p-4 bg-gray-50 rounded-lg">
            <h4 class="font-semibold mb-2">Usage Instructions:</h4>
            <ul class="list-disc list-inside space-y-1 text-sm text-gray-600">
              <li>Click any button to see the loading component in action</li>
              <li>The loading component shows a beautiful animated logo</li>
              <li>It includes a spinning animation and custom messages</li>
              <li>Responsive design works on all screen sizes</li>
              <li>Dark mode support included</li>
            </ul>
          </div>
        </div>
      </p-card>
    </div>
  `,
  styles: [`
    .loading-demo {
      padding: 2rem;
      min-height: 100vh;
      background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    }
  `]
})
export class LoadingDemoComponent {
  constructor() {}

  showLoading(): void {
    // This would typically call a service method
    // In a real app, you would inject the loading service and call:
    // this.loadingService.show();
  }

  showLoadingWithMessage(): void {
    // this.loadingService.showWithMessage('Processing your request...');
  }

  showLongLoading(): void {
    // this.loadingService.showWithMessage('This might take a while...');
    // setTimeout(() => this.loadingService.hide(), 5000);
  }

  hideLoading(): void {
    // this.loadingService.hide();
  }

  simulateApiCall(): void {
    // this.loadingService.showWithMessage('Fetching data from server...');
    // setTimeout(() => this.loadingService.hide(), 3000);
  }

  showErrorLoading(): void {
    // this.loadingService.showWithMessage('Something went wrong...');
    // setTimeout(() => this.loadingService.hide(), 2000);
  }
} 