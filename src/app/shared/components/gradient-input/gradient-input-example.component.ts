import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { GradientInputComponent } from './gradient-input.component';

@Component({
  selector: 'app-gradient-input-example',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, GradientInputComponent],
  template: `
    <div class="example-container">
      <h2>GradientInputComponent Examples</h2>

      <div class="examples-grid">
        <!-- Basic Example -->
        <div class="example-card">
          <h3>Basic Gradient Input</h3>
          <app-gradient-input
            [colors]="['#ff512f', '#dd2476']"
            direction="to right"
            placeholder="Enter gradient value..."
          />
        </div>

        <!-- Custom Direction -->
        <div class="example-card">
          <h3>Custom Direction (135deg)</h3>
          <app-gradient-input
            [colors]="['#667eea', '#764ba2']"
            direction="135deg"
            placeholder="Diagonal gradient..."
          />
        </div>

        <!-- Multiple Colors -->
        <div class="example-card">
          <h3>Multiple Colors</h3>
          <app-gradient-input
            [colors]="['#ff9a9e', '#fecfef', '#fecfef', '#ffecd2']"
            direction="to right"
            placeholder="Four color gradient..."
          />
        </div>

        <!-- RTL Support -->
        <div class="example-card">
          <h3>RTL Support</h3>
          <app-gradient-input
            [colors]="['#a8edea', '#fed6e3']"
            direction="to left"
            placeholder="RTL gradient..."
            [isRTL]="true"
          />
        </div>

        <!-- Readonly -->
        <div class="example-card">
          <h3>Readonly Mode</h3>
          <app-gradient-input
            [colors]="['#ffecd2', '#fcb69f']"
            direction="to bottom"
            placeholder="This is readonly..."
            [readonly]="true"
          />
        </div>

        <!-- Reactive Forms Integration -->
        <div class="example-card">
          <h3>Reactive Forms Integration</h3>
          <form [formGroup]="exampleForm">
            <app-gradient-input
              formControlName="gradientValue"
              [colors]="['#667eea', '#764ba2']"
              direction="to right"
              placeholder="Form controlled gradient..."
            />
            <p class="form-value">Form Value: {{ exampleForm.get('gradientValue')?.value }}</p>
          </form>
        </div>

        <!-- Dynamic Colors -->
        <div class="example-card">
          <h3>Dynamic Colors</h3>
          <div class="color-controls">
            <button (click)="changeColors()" class="color-btn">Change Colors</button>
            <button (click)="addColor()" class="color-btn">Add Color</button>
            <button (click)="removeColor()" class="color-btn">Remove Color</button>
          </div>
          <app-gradient-input
            [colors]="dynamicColors"
            [direction]="dynamicDirection"
            placeholder="Dynamic gradient..."
          />
        </div>
      </div>

      <!-- Code Examples -->
      <div class="code-examples">
        <h3>Usage Examples</h3>

        <div class="code-block">
          <h4>Basic Usage</h4>
          <pre><code>&lt;app-gradient-input
  [colors]="['#ff512f', '#dd2476']"
  direction="to right"
  placeholder="Enter gradient value..."
/&gt;</code></pre>
        </div>

        <div class="code-block">
          <h4>Reactive Forms</h4>
          <pre><code>&lt;app-gradient-input
  formControlName="gradientField"
  [colors]="['#667eea', '#764ba2']"
  direction="135deg"
  placeholder="Form gradient..."
/&gt;</code></pre>
        </div>

        <div class="code-block">
          <h4>TypeScript Interface</h4>
          <pre><code>@Input() colors: string[] = ['#ff512f', '#dd2476'];
@Input() direction: string = 'to right';
@Input() placeholder: string = '';
@Input() readonly: boolean = false;
@Input() isRTL: boolean = false;</code></pre>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .example-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .examples-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 3rem;
    }

    .example-card {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      padding: 1.5rem;
      background: white;
      box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
    }

    .example-card h3 {
      margin: 0 0 1rem 0;
      font-size: 1.125rem;
      font-weight: 600;
      color: #374151;
    }

    .color-controls {
      display: flex;
      gap: 0.5rem;
      margin-bottom: 1rem;
      flex-wrap: wrap;
    }

    .color-btn {
      padding: 0.375rem 0.75rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: background-color 0.2s;
    }

    .color-btn:hover {
      background: #2563eb;
    }

    .form-value {
      margin-top: 0.5rem;
      font-size: 0.875rem;
      color: #6b7280;
      font-family: monospace;
      background: #f9fafb;
      padding: 0.5rem;
      border-radius: 0.25rem;
    }

    .code-examples {
      margin-top: 3rem;
    }

    .code-examples h3 {
      margin-bottom: 1.5rem;
      font-size: 1.5rem;
      font-weight: 700;
      color: #111827;
    }

    .code-block {
      margin-bottom: 1.5rem;
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
      border-radius: 0.375rem;
      padding: 1rem;
      overflow-x: auto;
    }

    .code-block code {
      font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      font-size: 0.875rem;
      color: #374151;
    }
  `]
})
export class GradientInputExampleComponent {
  exampleForm: FormGroup;
  dynamicColors: string[] = ['#ff6b6b', '#4ecdc4', '#45b7d1'];
  dynamicDirection: string = 'to right';

  constructor(private fb: FormBuilder) {
    this.exampleForm = this.fb.group({
      gradientValue: ['linear-gradient(to right, #667eea, #764ba2)']
    });
  }

  changeColors() {
    const colorSets = [
      ['#ff9a9e', '#fecfef'],
      ['#667eea', '#764ba2'],
      ['#ffecd2', '#fcb69f'],
      ['#a8edea', '#fed6e3'],
      ['#ff9a9e', '#fecfef', '#fecfef', '#ffecd2']
    ];

    const randomSet = colorSets[Math.floor(Math.random() * colorSets.length)];
    this.dynamicColors = randomSet;
  }

  addColor() {
    const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#feca57', '#ff9ff3', '#54a0ff'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    this.dynamicColors = [...this.dynamicColors, randomColor];
  }

  removeColor() {
    if (this.dynamicColors.length > 1) {
      this.dynamicColors = this.dynamicColors.slice(0, -1);
    }
  }
}