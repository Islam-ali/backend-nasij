import { Component, EventEmitter, Output, Input, OnInit, OnChanges, SimpleChanges, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, FormArray, FormControl, FormsModule } from '@angular/forms';
import { InputSwitchModule } from 'primeng/inputswitch';

@Component({
  selector: 'app-gradient-builder',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, InputSwitchModule],
  templateUrl: './gradient-builder.component.html',
  styleUrls: ['./gradient-builder.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GradientBuilderComponent implements OnInit, OnChanges {
  // Computed property for current direction to avoid function calls in template
  get currentDirection(): string {
    return this.gradientForm?.get('direction')?.value || this.initialDirection;
  }

  get colorsArray(): FormArray {
    return this.gradientForm?.get('colors') as FormArray;
  }

  get hasBackground(): boolean {
    return !this.noBackground;
  }

  // TrackBy functions for better performance
  trackByDirection(index: number, item: any): string {
    return item.value;
  }

  trackByColor(index: number): number {
    return index;
  }

  trackByPreset(index: number, item: any): string {
    return item.name;
  }
  @Input() initialColors: string[] = ['#ff512f', '#dd2476'];
  @Input() initialDirection: string = 'to right';
  @Input() compact: boolean = false;
  @Input() noBackground: boolean = false;

  @Output() gradientChange = new EventEmitter<string>();
  @Output() colorsChange = new EventEmitter<string[]>();
  @Output() directionChange = new EventEmitter<string>();
  @Output() noBackgroundChange = new EventEmitter<boolean>();

  gradientForm!: FormGroup;
  // Separate array for text input binding to avoid FormControl interference
  colorValues: string[] = [];

  // Memoized values to avoid recalculation on every change detection
  private _memoizedGradient = '';
  private _memoizedGradientCSS = '';
  private _lastColors: string[] = [];
  private _lastDirection = '';

  directions = [
    { label: '→', value: 'to right', name: 'Right' },
    { label: '←', value: 'to left', name: 'Left' },
    { label: '↓', value: 'to bottom', name: 'Bottom' },
    { label: '↑', value: 'to top', name: 'Top' },
    { label: '↗', value: '135deg', name: '135°' },
    { label: '↖', value: '45deg', name: '45°' },
    { label: '↙', value: '225deg', name: '225°' },
    { label: '↘', value: '315deg', name: '315°' }
  ];

  presets = [
    { name: 'Sunset', colors: ['#ff9a9e', '#fecfef', '#fecfef', '#ffecd2'] },
    { name: 'Ocean', colors: ['#667eea', '#764ba2'] },
    { name: 'Fire', colors: ['#ff512f', '#dd2476'] },
    { name: 'Forest', colors: ['#134e5e', '#71b280'] },
    { name: 'Purple', colors: ['#a8edea', '#fed6e3'] },
    { name: 'Warm', colors: ['#ffecd2', '#fcb69f'] }
  ];

  constructor(private fb: FormBuilder, private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    this.initializeForm();
    this.updateColorValues();

    // Always emit the current gradient value on init
    this.cdr.detectChanges();
    setTimeout(() => {
      const gradient = this.currentGradient;
      this.gradientChange.emit(gradient);
    });

    this.emitChanges();
  }

  ngOnChanges(changes: SimpleChanges) {
    let needsUpdate = false;

    if (changes['initialColors'] && this.hasColorsChanged(changes['initialColors'])) {
      needsUpdate = true;
    }

    if (changes['initialDirection'] && this.hasDirectionChanged(changes['initialDirection'])) {
      needsUpdate = true;
    }

    if (changes['noBackground']) {
      // Update the internal noBackground property when input changes
      this.noBackground = changes['noBackground'].currentValue;
      this.cdr.markForCheck();
    }

    // Emit gradient change when initial values are set
    if ((changes['initialColors'] || changes['initialDirection']) && this.gradientForm) {
      setTimeout(() => {
        this.gradientChange.emit(this.currentGradient);
      });
    }

    if (needsUpdate && this.gradientForm) {
      this.updateFormFromInputs();
      this.updateColorValues();
      this.cdr.markForCheck();
    }
  }

  private initializeForm() {
    this.gradientForm = this.fb.group({
      direction: [this.initialDirection],
      colors: this.fb.array(this.initialColors.map(color => this.fb.control(color)))
    });

    // Use debounce to avoid too frequent emissions
    this.gradientForm.valueChanges.subscribe(() => {
      this.emitChanges();
      this.cdr.markForCheck();
    });
  }

  private updateFormFromInputs() {
    this.gradientForm.patchValue({
      direction: this.initialDirection
    });

    const colorsArray = this.gradientForm.get('colors') as FormArray;
    colorsArray.clear();
    this.initialColors.forEach(color => {
      colorsArray.push(this.fb.control(color));
    });

    this.updateColorValues();
  }

  private updateColorValues() {
    this.colorValues = this.colorsArray ? [...this.colorsArray.value] : [];
  }

  private hasColorsChanged(change: SimpleChanges['initialColors']): boolean {
    if (!change) return false;
    const current = this.colorsArray?.value || [];
    const previous = change.previousValue || [];
    return JSON.stringify(current) !== JSON.stringify(previous);
  }

  private hasDirectionChanged(change: SimpleChanges['initialDirection']): boolean {
    if (!change) return false;
    const current = this.gradientForm?.get('direction')?.value;
    const previous = change.previousValue;
    return current !== previous;
  }

  getColorControl(index: number): FormControl {
    return this.colorsArray.at(index) as FormControl;
  }

  get currentGradient(): string {
    const colors = this.colorsArray?.value || [];
    const direction = this.gradientForm.get('direction')?.value;

    // Check if values have changed since last calculation
    if (JSON.stringify(colors) === JSON.stringify(this._lastColors) &&
        direction === this._lastDirection &&
        this._memoizedGradient) {
      return this._memoizedGradient;
    }

    // Update memoized values
    this._lastColors = [...colors];
    this._lastDirection = direction;

    if (!colors || colors.length === 0) {
      this._memoizedGradient = '';
    } else {
      const colorString = colors.join(', ');
      this._memoizedGradient = `linear-gradient(${direction}, ${colorString})`;
    }

    return this._memoizedGradient;
  }

  get gradientCSS(): string {
    // gradientCSS is the same as currentGradient, so use memoization too
    if (this._memoizedGradientCSS !== this.currentGradient) {
      this._memoizedGradientCSS = this.currentGradient;
    }
    return this._memoizedGradientCSS;
  }

  addColor(color: string = '#ff512f') {
    this.colorsArray.push(this.fb.control(color));
    this.colorValues.push(color);
  }

  removeColor(index: number) {
    if (this.colorsArray.length > 2) {
      this.colorsArray.removeAt(index);
      this.colorValues.splice(index, 1);
    }
  }

  updateColor(index: number, color: string) {
    if (color) {
      this.colorsArray.at(index).setValue(color, { emitEvent: false });
      this.colorValues[index] = color;
      this.cdr.markForCheck();
    }
  }

  onColorPickerInput(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.colorValues[index] = value;
      this.updateColor(index, value);
    }
  }

  onColorTextInput(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();
    this.colorValues[index] = value;

    // Allow partial input while typing (don't validate on every keystroke)
    if (value.length >= 3 && this.isValidColor(value)) {
      this.updateColor(index, value);
    }
  }

  onColorTextBlur(index: number, event: Event) {
    const value = (event.target as HTMLInputElement).value.trim();

    if (value && this.isValidColor(value)) {
      this.updateColor(index, value);
    } else if (value && !this.isValidColor(value)) {
      // Reset to previous valid color if current input is invalid
      const currentFormValue = this.colorsArray.at(index).value;
      this.colorValues[index] = currentFormValue;
    } else if (!value) {
      // Handle empty input - reset to form value
      const currentFormValue = this.colorsArray.at(index).value;
      this.colorValues[index] = currentFormValue;
    }
  }

  isValidColor(color: string): boolean {
    // Basic color validation
    const hexRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    const rgbRegex = /^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/;
    const rgbaRegex = /^rgba\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3}),\s*(0|1|0?\.\d+)\)$/;
    const hslRegex = /^hsl\((\d{1,3}),\s*(\d{1,3})%,\s*(\d{1,3})%\)$/;

    // Check for valid hex colors (including shorthand)
    if (hexRegex.test(color)) return true;

    // Check for RGB/RGBA
    if (rgbRegex.test(color) || rgbaRegex.test(color)) return true;

    // Check for HSL
    if (hslRegex.test(color)) return true;

    // Check for named colors (basic validation)
    const namedColors = ['red', 'blue', 'green', 'yellow', 'black', 'white', 'gray', 'purple', 'orange', 'pink'];
    if (namedColors.includes(color.toLowerCase())) return true;

    return false;
  }

  setDirection(direction: string) {
    this.gradientForm.get('direction')?.setValue(direction);
  }

  onNoBackgroundChange(value: boolean) {
    this.noBackground = value;
    this.noBackgroundChange.emit(this.noBackground);
    this.cdr.markForCheck();
  }

  loadPreset(preset: { name: string; colors: string[] }) {
    const colorsArray = this.gradientForm.get('colors') as FormArray;
    colorsArray.clear();
    preset.colors.forEach(color => {
      colorsArray.push(this.fb.control(color));
    });
    this.updateColorValues();
  }

  copyToClipboard() {
    navigator.clipboard.writeText(this.gradientCSS).then(() => {
      // Could emit a copied event here
      console.log('Gradient copied to clipboard!');
    });
  }

  private emitChanges() {
    const colors = this.colorsArray?.value || [];
    const direction = this.gradientForm.get('direction')?.value;

    // Only emit if values have actually changed
    const currentGradient = this.currentGradient;
    if (currentGradient !== this._memoizedGradient) {
      this.gradientChange.emit(currentGradient);
    }

    if (JSON.stringify(colors) !== JSON.stringify(this._lastColors)) {
      this.colorsChange.emit(colors);
    }

    if (direction !== this._lastDirection) {
      this.directionChange.emit(direction);
    }
  }

  // Color picker helpers
  getColorStops(): { color: string; position: number }[] {
    const colors = this.colorsArray.value;
    const stops: { color: string; position: number }[] = [];

    colors.forEach((color: string, index: number) => {
      const position = colors.length > 1 ? (index / (colors.length - 1)) * 100 : 50;
      stops.push({ color, position });
    });

    return stops;
  }
}