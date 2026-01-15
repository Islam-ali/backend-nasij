import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GradientBuilderComponent } from './gradient-builder.component';

@Component({
  selector: 'app-gradient-builder-example',
  standalone: true,
  imports: [CommonModule, GradientBuilderComponent],
  template: `
    <div class="example-container">
      <h1>🎨 Gradient Builder Component</h1>
      <p class="description">
        Interactive gradient builder similar to cssgradient.io with live preview and color picker.
      </p>

      <div class="examples-grid">
        <!-- Full Featured -->
        <div class="example-card">
          <h3>Full Featured Builder</h3>
          <app-gradient-builder
            [initialColors]="['#ff512f', '#dd2476']"
            initialDirection="to right"
            (gradientChange)="onGradientChange($event)"
            (colorsChange)="onColorsChange($event)"
            (directionChange)="onDirectionChange($event)">
          </app-gradient-builder>
        </div>

        <!-- Compact Version -->
        <div class="example-card">
          <h3>Compact Version</h3>
          <app-gradient-builder
            [compact]="true"
            [initialColors]="['#667eea', '#764ba2']"
            initialDirection="135deg">
          </app-gradient-builder>
        </div>

        <!-- Custom Initial Values -->
        <div class="example-card">
          <h3>Custom Initial Values</h3>
          <app-gradient-builder
            [initialColors]="['#a8edea', '#fed6e3', '#d299c2', '#fef9d7']"
            initialDirection="to bottom">
          </app-gradient-builder>
        </div>
      </div>

      <!-- Output Display -->
      <div class="output-section">
        <h3>Live Output</h3>
        <div class="output-content">
          <div class="gradient-display" [style.background]="currentGradient">
            <span>Preview</span>
          </div>
          <div class="output-details">
            <div class="output-item">
              <strong>CSS:</strong>
              <code>{{ currentGradient }}</code>
            </div>
            <div class="output-item">
              <strong>Colors:</strong>
              <span>{{ currentColors.join(', ') }}</span>
            </div>
            <div class="output-item">
              <strong>Direction:</strong>
              <span>{{ currentDirection }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Usage Code -->
      <div class="code-examples">
        <h3>Usage Examples</h3>

        <div class="code-block">
          <h4>Basic Usage</h4>
          <pre><code>&lt;app-gradient-builder
  [initialColors]="['#ff512f', '#dd2476']"
  initialDirection="to right"
  (gradientChange)="onGradientChange($event)"&gt;
&lt;/app-gradient-builder&gt;</code></pre>
        </div>

        <div class="code-block">
          <h4>Compact Mode</h4>
          <pre><code>&lt;app-gradient-builder
  [compact]="true"
  [initialColors]="['#667eea', '#764ba2']"
  initialDirection="135deg"&gt;
&lt;/app-gradient-builder&gt;</code></pre>
        </div>

        <div class="code-block">
          <h4>With Event Handlers</h4>
          <pre><code>&lt;app-gradient-builder
  [initialColors]="colors"
  initialDirection="direction"
  (gradientChange)="onGradientChange($event)"
  (colorsChange)="onColorsChange($event)"
  (directionChange)="onDirectionChange($event)"&gt;
&lt;/app-gradient-builder&gt;</code></pre>
        </div>

        <div class="code-block">
          <h4>TypeScript Interface</h4>
          <pre><code>// Inputs
@Input() initialColors: string[] = ['#ff512f', '#dd2476'];
@Input() initialDirection: string = 'to right';
@Input() compact: boolean = false;

// Outputs
@Output() gradientChange = new EventEmitter&lt;string&gt;();
@Output() colorsChange = new EventEmitter&lt;string[]&gt;();
@Output() directionChange = new EventEmitter&lt;string&gt;();</code></pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }

    .description {
      text-align: center;
      color: #6b7280;
      margin-bottom: 3rem;
      font-size: 1.125rem;
      line-height: 1.6;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 2rem;
      margin-bottom: 3rem;
    }

    .example-card {
      background: white;
      border-radius: 12px;
      padding: 1.5rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .example-card h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
      text-align: center;
    }

    .output-section {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      margin-bottom: 3rem;
    }

    .output-section h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .output-content {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 2rem;
      align-items: start;
    }

    .gradient-display {
      height: 120px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 600;
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
      box-shadow: 0 2px 4px rgb(0 0 0 / 0.1);
    }

    .output-details {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .output-item {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;

      strong {
        font-size: 0.875rem;
        color: #6b7280;
        font-weight: 600;
      }

      code, span {
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
        font-size: 0.875rem;
        background: #f8fafc;
        padding: 0.5rem;
        border-radius: 4px;
        border: 1px solid #e2e8f0;
        word-break: break-all;
      }
    }

    .code-examples {
      background: white;
      border-radius: 12px;
      padding: 2rem;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    }

    .code-examples h3 {
      margin: 0 0 1.5rem 0;
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .code-block {
      margin-bottom: 1.5rem;

      &:last-child {
        margin-bottom: 0;
      }
    }

    .code-block h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1rem;
      font-weight: 600;
      color: #374151;
    }

    .code-block pre {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      margin: 0;
    }

    .code-block code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      color: #374151;
      line-height: 1.5;
    }

    @media (max-width: 768px) {
      .example-container {
        padding: 1rem;
      }

      .examples-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .output-content {
        grid-template-columns: 1fr;
        gap: 1.5rem;
      }

      .gradient-display {
        height: 100px;
      }
    }
  `]
})
export class GradientBuilderExampleComponent {
  currentGradient = 'linear-gradient(to right, #ff512f, #dd2476)';
  currentColors: string[] = ['#ff512f', '#dd2476'];
  currentDirection = 'to right';

  onGradientChange(gradient: string) {
    this.currentGradient = gradient;
  }

  onColorsChange(colors: string[]) {
    this.currentColors = colors;
  }

  onDirectionChange(direction: string) {
    this.currentDirection = direction;
  }
}