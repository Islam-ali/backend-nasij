import { Directive, ElementRef, EventEmitter, Input, OnDestroy, OnInit, Output, Renderer2 } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';

export interface ResizeEvent {
  colSpan: number;
  height?: number;
  breakpoint: 'sm' | 'md' | 'lg' | 'xl';
}

export interface ResizeConstraints {
  minColSpan?: number;
  maxColSpan?: number;
  minHeight?: number;
  maxHeight?: number;
}

/**
 * ResizableGridItemDirective
 * 
 * A production-ready directive for resizing grid items with:
 * - Horizontal resize (column span)
 * - Vertical resize (height)
 * - Corner resize (both)
 * - Mouse + Touch support
 * - requestAnimationFrame for smooth performance
 * - Configurable constraints
 * - FormControl integration
 * 
 * @example
 * ```html
 * <div
 *   appResizableGridItem
 *   [gridCols]="12"
 *   [colSpanControl]="colSpanFormGroup"
 *   [heightControl]="heightFormControl"
 *   [resizeMode]="'horizontal'"
 *   [constraints]="{ minColSpan: 1, maxColSpan: 12 }"
 *   (resize)="onResize($event)">
 * </div>
 * ```
 */
@Directive({
  selector: '[appResizableGridItem]',
  standalone: true
})
export class ResizableGridItemDirective implements OnInit, OnDestroy {
  // ═══════════════════════════════════════════════════════════
  // 📥 INPUTS
  // ═══════════════════════════════════════════════════════════

  /** Total grid columns (default: 12) */
  @Input() gridCols: number = 12;

  /** FormGroup containing colSpan controls (sm, md, lg, xl) */
  @Input() colSpanControl?: FormGroup<{
    sm: FormControl<number>;
    md: FormControl<number>;
    lg: FormControl<number>;
    xl: FormControl<number>;
  }>;

  /** FormControl for height */
  @Input() heightControl?: FormControl<number | string>;

  /** Resize mode: 'horizontal' | 'vertical' | 'both' */
  @Input() resizeMode: 'horizontal' | 'vertical' | 'both' = 'horizontal';

  /** Constraints for resize */
  @Input() constraints?: ResizeConstraints;

  /** Current breakpoint for responsive resize */
  @Input() currentBreakpoint: 'sm' | 'md' | 'lg' | 'xl' = 'lg';

  /** Enable resize (default: true) */
  @Input() enableResize: boolean = true;

  // ═══════════════════════════════════════════════════════════
  // 📤 OUTPUTS
  // ═══════════════════════════════════════════════════════════

  /** Emits when resize starts */
  @Output() resizeStart = new EventEmitter<void>();

  /** Emits during resize with current values */
  @Output() resize = new EventEmitter<ResizeEvent>();

  /** Emits when resize ends */
  @Output() resizeEnd = new EventEmitter<ResizeEvent>();

  // ═══════════════════════════════════════════════════════════
  // 🔒 PRIVATE STATE
  // ═══════════════════════════════════════════════════════════

  private isResizing = false;
  private resizeHandle?: HTMLElement;
  private startX = 0;
  private startY = 0;
  private startColSpan = 0;
  private startHeight = 0;
  private columnWidth = 0;
  private rafId?: number;
  private listeners: (() => void)[] = [];

  // ═══════════════════════════════════════════════════════════
  // 🏗️ CONSTRUCTOR
  // ═══════════════════════════════════════════════════════════

  constructor(
    private el: ElementRef<HTMLElement>,
    private renderer: Renderer2
  ) {}

  // ═══════════════════════════════════════════════════════════
  // 🎯 LIFECYCLE
  // ═══════════════════════════════════════════════════════════

  ngOnInit(): void {
    if (!this.enableResize) return;

    this.calculateColumnWidth();
    this.createResizeHandle();
    this.setupResizeListeners();
  }

  ngOnDestroy(): void {
    this.cleanup();
  }

  // ═══════════════════════════════════════════════════════════
  // 🎨 RESIZE HANDLE CREATION
  // ═══════════════════════════════════════════════════════════

  private createResizeHandle(): void {
    const handle = this.renderer.createElement('div');
    this.renderer.addClass(handle, 'resize-handle');
    this.renderer.addClass(handle, `resize-handle-${this.resizeMode}`);

    // Position based on mode
    if (this.resizeMode === 'horizontal' || this.resizeMode === 'both') {
      this.renderer.setStyle(handle, 'bottom', '0');
      this.renderer.setStyle(handle, 'right', '0');
      this.renderer.setStyle(handle, 'cursor', 'ew-resize');
    }
    if (this.resizeMode === 'vertical' || this.resizeMode === 'both') {
      this.renderer.setStyle(handle, 'bottom', '0');
      this.renderer.setStyle(handle, 'right', '0');
      this.renderer.setStyle(handle, 'cursor', this.resizeMode === 'both' ? 'nwse-resize' : 'ns-resize');
    }

    // Styles
    this.renderer.setStyle(handle, 'position', 'absolute');
    this.renderer.setStyle(handle, 'width', '16px');
    this.renderer.setStyle(handle, 'height', '16px');
    this.renderer.setStyle(handle, 'background', '#667eea');
    this.renderer.setStyle(handle, 'border-radius', '4px 0 0 0');
    this.renderer.setStyle(handle, 'z-index', '1000');
    this.renderer.setStyle(handle, 'opacity', '0');
    this.renderer.setStyle(handle, 'transition', 'opacity 0.2s');

    // Append to element
    this.renderer.setStyle(this.el.nativeElement, 'position', 'relative');
    this.renderer.appendChild(this.el.nativeElement, handle);

    this.resizeHandle = handle;

    // Show on hover
    this.setupHoverListeners(handle);
  }

  private setupHoverListeners(handle: HTMLElement): void {
    const mouseEnter = this.renderer.listen(this.el.nativeElement, 'mouseenter', () => {
      this.renderer.setStyle(handle, 'opacity', '1');
    });

    const mouseLeave = this.renderer.listen(this.el.nativeElement, 'mouseleave', () => {
      if (!this.isResizing) {
        this.renderer.setStyle(handle, 'opacity', '0');
      }
    });

    this.listeners.push(mouseEnter, mouseLeave);
  }

  // ═══════════════════════════════════════════════════════════
  // 📐 RESIZE LOGIC
  // ═══════════════════════════════════════════════════════════

  private setupResizeListeners(): void {
    if (!this.resizeHandle) return;

    const mousedown = this.renderer.listen(this.resizeHandle, 'mousedown', (e: MouseEvent) => {
      this.startResize(e);
    });

    const touchstart = this.renderer.listen(this.resizeHandle, 'touchstart', (e: TouchEvent) => {
      this.startResize(e);
    });

    this.listeners.push(mousedown, touchstart);
  }

  private startResize(event: MouseEvent | TouchEvent): void {
    event.preventDefault();
    event.stopPropagation();

    this.isResizing = true;
    this.resizeStart.emit();

    // Get start positions
    if (event instanceof MouseEvent) {
      this.startX = event.clientX;
      this.startY = event.clientY;
    } else {
      this.startX = event.touches[0].clientX;
      this.startY = event.touches[0].clientY;
    }

    // Get start values
    this.startColSpan = this.getCurrentColSpan();
    this.startHeight = this.getCurrentHeight();

    // Calculate column width if needed
    if (this.resizeMode === 'horizontal' || this.resizeMode === 'both') {
      this.calculateColumnWidth();
    }

    // Add global listeners
    const mousemove = this.renderer.listen('document', 'mousemove', (e: MouseEvent) => {
      this.onResizeMove(e);
    });

    const mouseup = this.renderer.listen('document', 'mouseup', () => {
      this.endResize();
      mouseup();
    });

    const touchmove = this.renderer.listen('document', 'touchmove', (e: TouchEvent) => {
      this.onResizeMove(e);
    });

    const touchend = this.renderer.listen('document', 'touchend', () => {
      this.endResize();
      touchend();
    });

    this.listeners.push(mousemove, mouseup, touchmove, touchend);

    // Visual feedback
    this.renderer.addClass(document.body, 'resizing-active');
    this.renderer.setStyle(document.body, 'cursor', this.getResizeCursor());
    this.renderer.setStyle(document.body, 'user-select', 'none');
  }

  private onResizeMove(event: MouseEvent | TouchEvent): void {
    if (!this.isResizing) return;

    event.preventDefault();

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const clientY = event instanceof MouseEvent ? event.clientY : event.touches[0].clientY;

    // Cancel previous RAF
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    // Use RAF for smooth performance
    this.rafId = requestAnimationFrame(() => {
      this.performResize(clientX, clientY);
    });
  }

  private performResize(clientX: number, clientY: number): void {
    const deltaX = clientX - this.startX;
    const deltaY = clientY - this.startY;

    let newColSpan = this.startColSpan;
    let newHeight = this.startHeight;

    // Calculate horizontal resize
    if (this.resizeMode === 'horizontal' || this.resizeMode === 'both') {
      const colSpanDelta = Math.round(deltaX / this.columnWidth);
      newColSpan = this.startColSpan + colSpanDelta;

      // Apply constraints
      const min = this.constraints?.minColSpan ?? 1;
      const max = this.constraints?.maxColSpan ?? this.gridCols;
      newColSpan = Math.max(min, Math.min(newColSpan, max));
    }

    // Calculate vertical resize
    if (this.resizeMode === 'vertical' || this.resizeMode === 'both') {
      newHeight = this.startHeight + deltaY;

      // Apply constraints
      const min = this.constraints?.minHeight ?? 100;
      const max = this.constraints?.maxHeight ?? 2000;
      newHeight = Math.max(min, Math.min(newHeight, max));
    }

    // Update form controls
    this.updateFormControls(newColSpan, newHeight);

    // Emit resize event
    this.resize.emit({
      colSpan: newColSpan,
      height: this.resizeMode !== 'horizontal' ? newHeight : undefined,
      breakpoint: this.currentBreakpoint
    });
  }

  private endResize(): void {
    if (!this.isResizing) return;

    this.isResizing = false;

    // Cleanup
    this.renderer.removeClass(document.body, 'resizing-active');
    this.renderer.removeStyle(document.body, 'cursor');
    this.renderer.removeStyle(document.body, 'user-select');

    if (this.resizeHandle) {
      this.renderer.setStyle(this.resizeHandle, 'opacity', '0');
    }

    // Emit final values
    const finalEvent: ResizeEvent = {
      colSpan: this.getCurrentColSpan(),
      height: this.resizeMode !== 'horizontal' ? this.getCurrentHeight() : undefined,
      breakpoint: this.currentBreakpoint
    };

    this.resizeEnd.emit(finalEvent);
  }

  // ═══════════════════════════════════════════════════════════
  // 🔧 HELPER METHODS
  // ═══════════════════════════════════════════════════════════

  private calculateColumnWidth(): void {
    const gridElement = this.findGridContainer();
    if (!gridElement) {
      this.columnWidth = 100; // Fallback
      return;
    }

    const gridWidth = gridElement.offsetWidth;
    const gap = parseFloat(getComputedStyle(gridElement).gap) || 0;
    const totalGaps = gap * (this.gridCols - 1);

    this.columnWidth = (gridWidth - totalGaps) / this.gridCols;
  }

  private findGridContainer(): HTMLElement | null {
    let parent = this.el.nativeElement.parentElement;
    while (parent) {
      const display = getComputedStyle(parent).display;
      if (display === 'grid') {
        return parent;
      }
      parent = parent.parentElement;
    }
    return null;
  }

  private getCurrentColSpan(): number {
    if (!this.colSpanControl) return 1;

    const control = this.colSpanControl.get(this.currentBreakpoint);
    return control?.value ?? 1;
  }

  private getCurrentHeight(): number {
    if (!this.heightControl) return 0;

    const value = this.heightControl.value;
    if (typeof value === 'string') {
      return parseFloat(value) || 0;
    }
    return value ?? 0;
  }

  private updateFormControls(colSpan: number, height: number): void {
    // Update colSpan for current breakpoint
    if (this.colSpanControl) {
      const control = this.colSpanControl.get(this.currentBreakpoint);
      if (control && control.value !== colSpan) {
        control.setValue(colSpan, { emitEvent: false });
      }
    }

    // Update height
    if (this.heightControl && this.resizeMode !== 'horizontal') {
      if (this.heightControl.value !== height) {
        this.heightControl.setValue(height, { emitEvent: false });
      }
    }
  }

  private getResizeCursor(): string {
    switch (this.resizeMode) {
      case 'horizontal': return 'ew-resize';
      case 'vertical': return 'ns-resize';
      case 'both': return 'nwse-resize';
      default: return 'default';
    }
  }

  private cleanup(): void {
    // Cancel RAF
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
    }

    // Remove listeners
    this.listeners.forEach(unlisten => unlisten());
    this.listeners = [];

    // Remove handle
    if (this.resizeHandle) {
      this.renderer.removeChild(this.el.nativeElement, this.resizeHandle);
    }

    // Reset body styles
    this.renderer.removeClass(document.body, 'resizing-active');
    this.renderer.removeStyle(document.body, 'cursor');
    this.renderer.removeStyle(document.body, 'user-select');
  }
}









