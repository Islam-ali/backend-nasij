# GradientBuilderComponent

An interactive gradient builder component similar to cssgradient.io, featuring live preview, color picker, direction controls, and preset gradients.

## ✨ Features

- 🎨 **Live Preview**: Real-time gradient rendering
- 🎯 **Color Picker**: Visual color selection with hex input
- 📐 **Direction Controls**: 8 directional options + custom angles
- 🎭 **Presets**: Pre-built gradient collections
- 📋 **Copy to Clipboard**: One-click CSS copying
- 📱 **Responsive**: Mobile-friendly design
- 🌙 **Dark Mode**: Automatic theme detection
- 🔧 **Compact Mode**: Space-efficient version
- ⚡ **Reactive**: Event-driven updates

## 🚀 Installation

```typescript
// Import in your component
import { GradientBuilderComponent } from './shared/components/gradient-builder/gradient-builder.component';

// Add to imports array
imports: [GradientBuilderComponent]
```

## 📋 API

### Inputs

| Input | Type | Default | Description |
|-------|------|---------|-------------|
| `initialColors` | `string[]` | `['#ff512f', '#dd2476']` | Initial color array |
| `initialDirection` | `string` | `'to right'` | Initial gradient direction |
| `compact` | `boolean` | `false` | Enable compact mode (hides presets) |

### Outputs

| Output | Type | Description |
|--------|------|-------------|
| `gradientChange` | `EventEmitter<string>` | Emits CSS gradient string on change |
| `colorsChange` | `EventEmitter<string[]>` | Emits color array on change |
| `directionChange` | `EventEmitter<string>` | Emits direction on change |

## 💡 Usage Examples

### Basic Usage

```html
<app-gradient-builder
  (gradientChange)="onGradientChange($event)">
</app-gradient-builder>
```

### With Initial Values

```typescript
// Component
initialColors = ['#667eea', '#764ba2'];
initialDirection = '135deg';
```

```html
<app-gradient-builder
  [initialColors]="initialColors"
  [initialDirection]="initialDirection"
  (gradientChange)="onGradientChange($event)">
</app-gradient-builder>
```

### Compact Mode

```html
<app-gradient-builder
  [compact]="true"
  [initialColors]="['#ffecd2', '#fcb69f']"
  initialDirection="to bottom">
</app-gradient-builder>
```

### Reactive Forms Integration

```typescript
// Component
export class MyComponent {
  gradientForm = this.fb.group({
    background: ['linear-gradient(to right, #ff512f, #dd2476)']
  });

  onGradientChange(gradient: string) {
    this.gradientForm.get('background')?.setValue(gradient);
  }
}
```

```html
<form [formGroup]="gradientForm">
  <app-gradient-builder
    [initialColors]="extractColors(gradientForm.get('background')?.value)"
    [initialDirection]="extractDirection(gradientForm.get('background')?.value)"
    (gradientChange)="onGradientChange($event)">
  </app-gradient-builder>
</form>
```

## 🎨 Direction Options

| Visual | Value | Description |
|--------|-------|-------------|
| → | `to right` | Left to right |
| ← | `to left` | Right to left |
| ↓ | `to bottom` | Top to bottom |
| ↑ | `to top` | Bottom to top |
| ↗ | `135deg` | 135 degrees |
| ↖ | `45deg` | 45 degrees |
| ↙ | `225deg` | 225 degrees |
| ↘ | `315deg` | 315 degrees |

## 🎭 Presets

Built-in gradient presets:

- **Sunset**: `['#ff9a9e', '#fecfef', '#fecfef', '#ffecd2']`
- **Ocean**: `['#667eea', '#764ba2']`
- **Fire**: `['#ff512f', '#dd2476']`
- **Forest**: `['#134e5e', '#71b280']`
- **Purple**: `['#a8edea', '#fed6e3']`
- **Warm**: `['#ffecd2', '#fcb69f']`

## 🎯 Component Methods

| Method | Description |
|--------|-------------|
| `addColor(color?)` | Add new color to gradient |
| `removeColor(index)` | Remove color at index |
| `updateColor(index, color)` | Update color at index |
| `setDirection(direction)` | Set gradient direction |
| `loadPreset(preset)` | Load preset gradient |
| `copyToClipboard()` | Copy CSS to clipboard |

## 🎨 Styling

### CSS Classes

```scss
.gradient-builder {
  // Main container
  &.compact {} // Compact mode styles

  .gradient-preview {} // Preview area
  .direction-grid {} // Direction buttons
  .colors-list {} // Color picker list
  .presets-grid {} // Preset buttons
}
```

### Custom Styling

```scss
// Override default styles
app-gradient-builder {
  ::ng-deep .gradient-builder {
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
}
```

## 📱 Responsive Design

- **Desktop**: Full featured with presets
- **Tablet**: Optimized grid layouts
- **Mobile**: Compact mode recommended
- **Touch**: Touch-friendly controls

## 🌙 Dark Mode

Automatically detects system preference:

```scss
@media (prefers-color-scheme: dark) {
  // Dark mode styles applied automatically
}
```

## 🔧 TypeScript Interface

```typescript
export interface GradientPreset {
  name: string;
  colors: string[];
}

export interface ColorStop {
  color: string;
  position: number;
}
```

## 🧪 Testing

```typescript
describe('GradientBuilderComponent', () => {
  it('should emit gradient on change', () => {
    const fixture = TestBed.createComponent(GradientBuilderComponent);
    spyOn(fixture.componentInstance.gradientChange, 'emit');

    fixture.componentInstance.addColor('#000000');

    expect(fixture.componentInstance.gradientChange.emit).toHaveBeenCalled();
  });
});
```

## 🚀 Performance

- **OnPush Change Detection**: Optimized for performance
- **Minimal Re-renders**: Smart change detection
- **Lazy Loading**: Components load on demand
- **Memory Efficient**: Proper cleanup on destroy

## 🎯 Browser Support

- ✅ Chrome 90+
- ✅ Firefox 88+
- ✅ Safari 14+
- ✅ Edge 90+

## 🔮 Future Enhancements

- [ ] Color picker popup
- [ ] Gradient history
- [ ] Export formats (SCSS, LESS)
- [ ] Animation controls
- [ ] Custom angle input
- [ ] Color blindness support

## 📝 Contributing

1. Follow Angular style guide
2. Add comprehensive tests
3. Update documentation
4. Maintain backwards compatibility
5. Test across browsers

## 📄 License

MIT License - feel free to use in your projects!