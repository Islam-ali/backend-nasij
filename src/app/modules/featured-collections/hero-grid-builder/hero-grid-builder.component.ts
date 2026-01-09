import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormControl } from '@angular/forms';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { SliderModule } from 'primeng/slider';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TabViewModule } from 'primeng/tabview';
import { TooltipModule } from 'primeng/tooltip';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';

import { IProfessionalGridConfig, Responsive, IBreakpoint } from '../../../interfaces/professional-grid.interface';

@Component({
  selector: 'app-hero-grid-builder',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    DragDropModule,
    ButtonModule,
    InputNumberModule,
    SliderModule,
    SelectButtonModule,
    TabViewModule,
    TooltipModule,
    InputTextModule,
    CardModule,
    PanelModule,
  ],
  templateUrl: './hero-grid-builder.component.html',
  styleUrls: ['./hero-grid-builder.component.scss'],
})
export class HeroGridBuilderComponent implements OnInit, OnChanges {
  @Input() collectionsCount: number = 0;
  @Input() config?: IProfessionalGridConfig;
  @Output() configChange = new EventEmitter<IProfessionalGridConfig>();

  heroGridForm!: FormGroup;
  
  // Breakpoints
  breakpoints: IBreakpoint[] = [
    { name: 'base', label: 'Mobile', icon: 'pi pi-mobile', minWidth: '0px', active: true },
    { name: 'md', label: 'Tablet', icon: 'pi pi-tablet', minWidth: '768px', active: false },
    { name: 'lg', label: 'Desktop', icon: 'pi pi-desktop', minWidth: '1024px', active: false },
    { name: 'xl', label: 'Large', icon: 'pi pi-window-maximize', minWidth: '1280px', active: false },
  ];

  activeBreakpoint = signal<'base' | 'md' | 'lg' | 'xl'>('lg');
  selectedItemIndex = signal<number | null>(null);

  // Grid options
  columnOptions = [
    { label: '4', value: 4 },
    { label: '6', value: 6 },
    { label: '8', value: 8 },
    { label: '12', value: 12 },
  ];

  // Row height presets
  rowHeightPresets = [
    { label: 'Auto', value: 'auto' },
    { label: '200px', value: '200px' },
    { label: '300px', value: '300px' },
    { label: 'minmax(220px,1fr)', value: 'minmax(220px,1fr)' },
    { label: '1fr', value: '1fr' },
  ];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.initForm();
    if (this.config) {
      this.loadConfig(this.config);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['collectionsCount'] && !changes['collectionsCount'].firstChange) {
      // Re-initialize items when collections count changes
      this.initItems();
    }
  }

  initForm(): void {
    this.heroGridForm = this.fb.group({
      columns: this.fb.group({
        base: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
        md: [2, [Validators.min(1), Validators.max(12)]],
        lg: [3, [Validators.min(1), Validators.max(12)]],
        xl: [4, [Validators.min(1), Validators.max(12)]],
      }),
      rows: this.fb.group({
        base: [null, [Validators.min(1), Validators.max(12)]],
        md: [null, [Validators.min(1), Validators.max(12)]],
        lg: [2, [Validators.min(1), Validators.max(12)]],
        xl: [null, [Validators.min(1), Validators.max(12)]],
      }),
      rowHeight: this.fb.group({
        base: ['auto'],
        md: ['auto'],
        lg: ['minmax(220px,1fr)'],
        xl: ['minmax(220px,1fr)'],
      }),
      gap: [24, [Validators.min(0), Validators.max(384)]],
      items: this.fb.array([]),
      wrapperClass: ['container mx-auto px-4'],
      justifyContent: ['center'],
      alignItems: ['stretch'],
    });

    // Initialize items based on collections count
    this.initItems();

    // Watch for form changes
    this.heroGridForm.valueChanges.subscribe(() => {
      this.emitConfig();
    });
  }

  initItems(): void {
    const itemsArray = this.heroGridForm.get('items') as FormArray;
    itemsArray.clear();

    for (let i = 0; i < this.collectionsCount; i++) {
      itemsArray.push(this.createItemGroup(i));
    }
  }

  createItemGroup(index: number): FormGroup {
    // Default: first item spans 2 rows on lg, others span 1
    const defaultRowSpan = index === 0 ? { base: 1, lg: 2 } : { base: 1, lg: 1 };
    
    return this.fb.group({
      colSpan: this.fb.group({
        base: [1],
        md: [1],
        lg: [1],
        xl: [1],
      }),
      rowSpan: this.fb.group({
        base: [defaultRowSpan.base],
        md: [defaultRowSpan.base],
        lg: [defaultRowSpan.lg],
        xl: [defaultRowSpan.lg],
      }),
      customClass: [''],
    });
  }

  loadConfig(config: IProfessionalGridConfig): void {
    if (config.columns) {
      this.heroGridForm.patchValue({ columns: config.columns });
    }
    if (config.rows) {
      this.heroGridForm.patchValue({ rows: config.rows });
    }
    if (config.rowHeight) {
      this.heroGridForm.patchValue({ rowHeight: config.rowHeight });
    }
    if (config.gap !== undefined) {
      this.heroGridForm.patchValue({ gap: config.gap });
    }
    if (config.wrapperClass) {
      this.heroGridForm.patchValue({ wrapperClass: config.wrapperClass });
    }
    if (config.justifyContent) {
      this.heroGridForm.patchValue({ justifyContent: config.justifyContent });
    }
    if (config.alignItems) {
      this.heroGridForm.patchValue({ alignItems: config.alignItems });
    }
    
    // Load items
    if (config.items && config.items.length > 0) {
      const itemsArray = this.heroGridForm.get('items') as FormArray;
      itemsArray.clear();
      config.items.forEach(item => {
        itemsArray.push(this.fb.group({
          colSpan: this.fb.group(item.colSpan || {}),
          rowSpan: this.fb.group(item.rowSpan || {}),
          customClass: [item.customClass || ''],
        }));
      });
    }
  }

  emitConfig(): void {
    const formValue = this.heroGridForm.value;
    const config: IProfessionalGridConfig = {
      columns: formValue.columns,
      rows: formValue.rows,
      rowHeight: formValue.rowHeight,
      gap: formValue.gap,
      items: formValue.items,
      wrapperClass: formValue.wrapperClass,
      justifyContent: formValue.justifyContent,
      alignItems: formValue.alignItems,
    };
    this.configChange.emit(config);
  }

  get itemsArray(): FormArray {
    return this.heroGridForm.get('items') as FormArray;
  }

  getItemGroup(index: number): FormGroup {
    return this.itemsArray.at(index) as FormGroup;
  }

  switchBreakpoint(breakpoint: 'base' | 'md' | 'lg' | 'xl'): void {
    this.activeBreakpoint.set(breakpoint);
    this.breakpoints.forEach(bp => bp.active = bp.name === breakpoint);
  }

  selectItem(index: number): void {
    this.selectedItemIndex.set(index);
  }

  // Get current column count for active breakpoint
  getCurrentColumns(): number {
    const breakpoint = this.activeBreakpoint();
    const columnsGroup = this.heroGridForm.get('columns') as FormGroup;
    return columnsGroup.get(breakpoint)?.value || 1;
  }

  // Get current row count for active breakpoint
  getCurrentRows(): number | null {
    const breakpoint = this.activeBreakpoint();
    const rowsGroup = this.heroGridForm.get('rows') as FormGroup;
    return rowsGroup.get(breakpoint)?.value || null;
  }

  // Get item span classes for preview
  getItemColSpan(index: number): number {
    const breakpoint = this.activeBreakpoint();
    const itemGroup = this.getItemGroup(index);
    const colSpanGroup = itemGroup.get('colSpan') as FormGroup;
    return colSpanGroup.get(breakpoint)?.value || 1;
  }

  getItemRowSpan(index: number): number {
    const breakpoint = this.activeBreakpoint();
    const itemGroup = this.getItemGroup(index);
    const rowSpanGroup = itemGroup.get('rowSpan') as FormGroup;
    return rowSpanGroup.get(breakpoint)?.value || 1;
  }

  // Get grid template CSS for preview
  getGridStyle(): any {
    const cols = this.getCurrentColumns();
    const rows = this.getCurrentRows();
    const gap = this.heroGridForm.get('gap')?.value || 24;
    const breakpoint = this.activeBreakpoint();
    const rowHeightGroup = this.heroGridForm.get('rowHeight') as FormGroup;
    const rowHeight = rowHeightGroup.get(breakpoint)?.value || 'auto';

    return {
      'display': 'grid',
      'grid-template-columns': `repeat(${cols}, 1fr)`,
      'grid-template-rows': rows ? `repeat(${rows}, ${rowHeight})` : `auto`,
      'grid-auto-rows': rowHeight,
      'gap': `${gap}px`,
    };
  }

  getItemStyle(index: number): any {
    const colSpan = this.getItemColSpan(index);
    const rowSpan = this.getItemRowSpan(index);
    const isSelected = this.selectedItemIndex() === index;

    return {
      'grid-column': `span ${colSpan}`,
      'grid-row': `span ${rowSpan}`,
      'border': isSelected ? '2px solid #3B82F6' : '2px dashed #4B5563',
      'background': isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(75, 85, 99, 0.1)',
      'border-radius': '8px',
      'padding': '1rem',
      'cursor': 'pointer',
      'transition': 'all 0.2s',
    };
  }

  // Drag and drop for items reordering
  onItemsReorder(event: CdkDragDrop<any[]>): void {
    const itemsArray = this.itemsArray;
    const items = itemsArray.controls;
    moveItemInArray(items, event.previousIndex, event.currentIndex);
    itemsArray.setValue(items.map(control => control.value));
  }

  // Update columns for active breakpoint
  setColumns(value: number): void {
    const breakpoint = this.activeBreakpoint();
    const columnsGroup = this.heroGridForm.get('columns') as FormGroup;
    columnsGroup.get(breakpoint)?.setValue(value);
  }

  // Gap to Tailwind class converter
  getGapTailwindClass(): string {
    const gap = this.heroGridForm.get('gap')?.value || 0;
    // Convert px to Tailwind scale (1 unit = 4px)
    const scale = Math.round(gap / 4);
    return `gap-${scale}`;
  }
}


