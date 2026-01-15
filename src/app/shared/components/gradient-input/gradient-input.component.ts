import { Component, Input, forwardRef, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlValueAccessor, NG_VALUE_ACCESSOR, FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-gradient-input',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './gradient-input.component.html',
  styleUrls: ['./gradient-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => GradientInputComponent),
      multi: true
    }
  ]
})
export class GradientInputComponent implements ControlValueAccessor, OnInit, OnDestroy, OnChanges {
  @Input() colors: string[] = ['#ff512f', '#dd2476'];
  @Input() direction: string = 'to right';
  @Input() placeholder: string = '';
  @Input() readonly: boolean = false;
  @Input() isRTL: boolean = false;

  private destroy$ = new Subject<void>();
  private onChange = (value: any) => {};
  private onTouched = () => {};

  // Form control for display only
  gradientControl = new FormControl('');

  ngOnInit() {
    this.updateGradientDisplay();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  // Generate CSS gradient string
  get gradientString(): string {
    if (!this.colors || this.colors.length === 0) {
      return 'transparent';
    }

    const colorString = this.colors.join(', ');
    return `linear-gradient(${this.direction}, ${colorString})`;
  }

  // Get display value for the input
  get displayValue(): string {
    return this.gradientString;
  }

  private updateGradientDisplay() {
    this.gradientControl.setValue(this.displayValue);
  }

  // ControlValueAccessor implementation
  writeValue(value: any): void {
    // Display only - don't change the gradient based on form value
    // This component is for display purposes
    this.updateGradientDisplay();
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    if (isDisabled) {
      this.gradientControl.disable();
    } else {
      this.gradientControl.enable();
    }
  }

  // Handle input interactions
  onInputFocus() {
    this.onTouched();
  }

  // Update gradient when inputs change
  ngOnChanges(changes: SimpleChanges) {
    if (changes['colors'] || changes['direction']) {
      this.updateGradientDisplay();
    }
  }
}