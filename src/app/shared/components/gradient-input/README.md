# GradientInputComponent

A reusable Angular component that displays CSS linear gradients in an input field, similar to cssgradient.io. Perfect for visual gradient previews in forms.

## Features

- ✅ **Reactive Forms Support**: Implements `ControlValueAccessor`
- ✅ **Display Only**: Does not mutate FormControl values
- ✅ **Dynamic Colors & Direction**: Accepts color arrays and gradient direction
- ✅ **RTL Support**: Built-in right-to-left language support
- ✅ **Modern Styling**: Isolated SCSS with dark mode support
- ✅ **Accessibility**: Proper focus states and keyboard navigation
- ✅ **TypeScript**: Full type safety
- ✅ **Standalone Component**: No module dependencies

## Installation

```typescript
// Import in your component
import { GradientInputComponent } from './shared/components/gradient-input/gradient-input.component';

// Add to imports array
imports: [GradientInputComponent]
```

## API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `colors` | `string[]` | `['#ff512f', '#dd2476']` | Array of CSS color values |
| `direction` | `string` | `'to right'` | CSS gradient direction (e.g., 'to right', '135deg') |
| `placeholder` | `string` | `''` | Input placeholder text |
| `readonly` | `boolean` | `false` | Whether the input is readonly |
| `isRTL` | `boolean` | `false` | Enable RTL text direction |

### Methods

| Method | Description |
|--------|-------------|
| `writeValue(value: any)` | ControlValueAccessor implementation |
| `registerOnChange(fn)` | ControlValueAccessor implementation |
| `registerOnTouched(fn)` | ControlValueAccessor implementation |
| `setDisabledState(isDisabled)` | ControlValueAccessor implementation |

### Properties

| Property | Type | Description |
|----------|------|-------------|
| `gradientString` | `string` | Generated CSS gradient string |
| `displayValue` | `string` | Formatted display value |

## Usage Examples

### Basic Usage

```html
<app-gradient-input
  [colors]="['#ff512f', '#dd2476']"
  direction="to right"
  placeholder="Beautiful gradient..."
/>
```

### Reactive Forms

```typescript
// In your component
gradientForm = this.fb.group({
  gradientField: ['linear-gradient(to right, #667eea, #764ba2)']
});
```

```html
<form [formGroup]="gradientForm">
  <app-gradient-input
    formControlName="gradientField"
    [colors]="['#667eea', '#764ba2']"
    direction="135deg"
    placeholder="Form gradient..."
  />
</form>
```

### Dynamic Colors

```typescript
export class MyComponent {
  dynamicColors: string[] = ['#ff6b6b', '#4ecdc4'];

  updateColors() {
    this.dynamicColors = ['#667eea', '#764ba2', '#f093fb'];
  }
}
```

```html
<app-gradient-input
  [colors]="dynamicColors"
  direction="to right"
  placeholder="Dynamic gradient..."
/>
```

### RTL Support

```html
<app-gradient-input
  [colors]="['#a8edea', '#fed6e3']"
  direction="to left"
  placeholder="RTL gradient..."
  [isRTL]="currentLanguage === 'ar'"
/>
```

### Readonly Mode

```html
<app-gradient-input
  [colors]="['#ffecd2', '#fcb69f']"
  direction="to bottom"
  placeholder="Display only..."
  [readonly]="true"
/>
```

## CSS Gradient Examples

### Two Colors
```typescript
colors: ['#ff512f', '#dd2476']
direction: 'to right'
// Result: linear-gradient(to right, #ff512f, #dd2476)
```

### Multiple Colors
```typescript
colors: ['#ff9a9e', '#fecfef', '#fecfef', '#ffecd2']
direction: '135deg'
// Result: linear-gradient(135deg, #ff9a9e, #fecfef, #fecfef, #ffecd2)
```

### Direction Options
- `'to right'` - Left to right
- `'to left'` - Right to left
- `'to bottom'` - Top to bottom
- `'to top'` - Bottom to top
- `'135deg'` - Diagonal at 135 degrees
- `'45deg'` - Diagonal at 45 degrees

## Styling

The component includes comprehensive styling:

- **Modern Design**: Rounded corners, shadows, smooth transitions
- **Dark Mode**: Automatic dark mode support via `prefers-color-scheme`
- **Responsive**: Mobile-optimized padding and sizing
- **Accessibility**: Proper focus indicators and contrast
- **RTL Ready**: Text alignment and direction support

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Architecture Notes

### ControlValueAccessor
The component implements `ControlValueAccessor` but operates in **display-only mode**. It will show the gradient but won't modify the FormControl value. This design allows:

- Visual feedback without data mutation
- Integration with existing forms
- Future extensibility for color picker functionality

### Standalone Component
Built as a standalone Angular component for:
- Better tree-shaking
- Reduced bundle size
- Easier testing
- Modern Angular architecture

### Change Detection
Uses `OnChanges` to efficiently update the gradient when inputs change, avoiding unnecessary re-renders.

## Future Enhancements

The component is designed for easy extension:

- **Color Picker Integration**: Add color picker functionality
- **Gradient Presets**: Built-in gradient collections
- **Animation Support**: Animated gradient transitions
- **Export Formats**: Additional format support (SCSS, LESS, etc.)

## Testing

```typescript
// Basic component test
it('should display gradient', () => {
  const fixture = TestBed.createComponent(GradientInputComponent);
  fixture.componentInstance.colors = ['#ff0000', '#0000ff'];
  fixture.componentInstance.direction = 'to right';
  fixture.detectChanges();

  const input = fixture.nativeElement.querySelector('input');
  expect(input.style.background).toContain('linear-gradient');
});
```

## Contributing

When extending this component:

1. Maintain the display-only philosophy
2. Keep TypeScript strict mode enabled
3. Add comprehensive tests for new features
4. Update this README with new API changes
5. Follow Angular style guide conventions