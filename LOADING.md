# Loading Component Documentation

## Overview

The loading component provides a beautiful, animated loading screen with a logo that can be used throughout the application. It includes:

- ✅ Animated SVG logo with spinning animation
- ✅ Customizable loading messages
- ✅ Responsive design
- ✅ Dark mode support
- ✅ Smooth transitions
- ✅ Global loading service

## Features

### 🎨 Visual Features
- **Animated Logo**: SVG-based logo with spinning animation
- **Gradient Background**: Beautiful gradient background with blur effects
- **Glass Morphism**: Modern glass-like design with backdrop blur
- **Responsive**: Works perfectly on all screen sizes
- **Dark Mode**: Automatic dark mode support

### ⚙️ Technical Features
- **Standalone Component**: Built with Angular standalone components
- **TypeScript**: Fully typed with TypeScript
- **Observable-based**: Uses RxJS for state management
- **Service Integration**: Global loading service for app-wide control

## Usage

### Basic Usage

The loading component is already integrated into the main app component and will show automatically when the application starts.

### Using the Loading Service

```typescript
import { AppLoadingService } from './core/services/app-loading.service';

@Component({...})
export class MyComponent {
  constructor(private loadingService: AppLoadingService) {}

  // Show loading with default message
  showLoading() {
    this.loadingService.show();
  }

  // Show loading with custom message
  showLoadingWithMessage() {
    this.loadingService.showWithMessage('Processing your request...');
  }

  // Hide loading
  hideLoading() {
    this.loadingService.hide();
  }
}
```

### Example: API Call with Loading

```typescript
async fetchData() {
  this.loadingService.showWithMessage('Fetching data...');
  
  try {
    const data = await this.apiService.getData();
    // Process data
  } catch (error) {
    console.error('Error fetching data:', error);
  } finally {
    this.loadingService.hide();
  }
}
```

### Example: Form Submission with Loading

```typescript
async submitForm() {
  this.loadingService.showWithMessage('Submitting form...');
  
  try {
    await this.formService.submit(this.formData);
    this.showSuccessMessage();
  } catch (error) {
    this.showErrorMessage(error);
  } finally {
    this.loadingService.hide();
  }
}
```

## Customization

### Changing the Logo

The current logo is an SVG with "LOGO" text. To customize:

1. **Replace with Image**: Update the SVG in `app.component.ts` with an `<img>` tag
2. **Custom SVG**: Replace the SVG content with your own design
3. **External Image**: Use an image URL instead of SVG

### Example: Using Custom Image

```typescript
template: `
  <div class="loading-logo">
    <img src="assets/images/your-logo.png" alt="Your Logo" />
  </div>
`
```

### Customizing Colors

The loading component uses CSS custom properties that can be overridden:

```scss
:root {
  --loading-bg-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --loading-text-color: white;
  --loading-spinner-color: white;
}
```

### Customizing Animation

The spinning animation can be customized in the CSS:

```scss
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
```

## Component Structure

```
src/app/
├── app.component.ts              # Main app with loading integration
├── core/services/
│   └── app-loading.service.ts    # Loading service
└── shared/components/
    ├── loading/                  # Basic loading component
    ├── global-loading/           # Global loading wrapper
    └── loading-demo/             # Demo component
```

## API Reference

### AppLoadingService

#### Methods

- `show()`: Show loading with default message
- `showWithMessage(message: string)`: Show loading with custom message
- `hide()`: Hide loading

#### Properties

- `isLoading$: Observable<boolean>`: Loading state observable
- `loadingMessage$: Observable<string>`: Loading message observable

### LoadingComponent

#### Inputs

- `logoUrl: string`: URL of the logo image
- `logoAlt: string`: Alt text for the logo
- `message: string`: Loading message
- `showText: boolean`: Whether to show the text
- `spinning: boolean`: Whether the logo should spin
- `fullscreen: boolean`: Whether to show fullscreen

## Best Practices

### 1. Always Hide Loading
```typescript
try {
  this.loadingService.show();
  await this.someAsyncOperation();
} finally {
  this.loadingService.hide(); // Always hide, even on error
}
```

### 2. Use Descriptive Messages
```typescript
// Good
this.loadingService.showWithMessage('Saving your changes...');

// Bad
this.loadingService.showWithMessage('Loading...');
```

### 3. Don't Show Loading for Fast Operations
```typescript
// Only show loading for operations that take > 500ms
if (expectedDuration > 500) {
  this.loadingService.show();
}
```

### 4. Handle Errors Gracefully
```typescript
try {
  this.loadingService.showWithMessage('Processing...');
  await this.riskyOperation();
} catch (error) {
  this.showError(error);
} finally {
  this.loadingService.hide();
}
```

## Troubleshooting

### Loading Not Showing
- Check if the service is properly injected
- Verify the component is subscribed to the service observables
- Check browser console for errors

### Loading Not Hiding
- Ensure `hide()` is called in a `finally` block
- Check for unhandled promise rejections
- Verify the component is properly destroyed

### Performance Issues
- Don't show loading for very fast operations
- Use `takeUntil` to properly unsubscribe from observables
- Consider using `debounceTime` for rapid show/hide calls

## Examples

See `src/app/shared/components/loading-demo/loading-demo.component.ts` for a complete example of how to use the loading component with different scenarios. 