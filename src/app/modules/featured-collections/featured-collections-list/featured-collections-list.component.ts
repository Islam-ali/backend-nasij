import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule, FormControl, AbstractControl } from '@angular/forms';

// PrimeNG Services
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Modules
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';

import { IFeaturedCollection, ICollectionItem } from '../../../interfaces/featured-collection.interface';
import { FeaturedCollectionsService } from '../../../services/featured-collections.service';
import { CategoryService } from '../../../services/category.service';
import { BrandService } from '../../../services/brand.service';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { BaseResponse } from '../../../core/models/baseResponse';
import { TextareaModule } from 'primeng/textarea';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { AccordionModule } from 'primeng/accordion';
import { TabViewModule } from 'primeng/tabview';
import { PanelModule } from 'primeng/panel';
import { OrderListModule } from 'primeng/orderlist';
import { SliderModule } from 'primeng/slider';
import { ColorPickerModule } from 'primeng/colorpicker';
import { SelectButtonModule } from 'primeng/selectbutton';
import { TooltipModule } from 'primeng/tooltip';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ICategory } from '../../../interfaces/category.interface';
import { IBrand } from '../../../interfaces/brand.interface';
import { IPackage } from '../../../interfaces/package.interface';
import { PackageService } from '../../../services/package.service';
import { IProduct } from '../../../interfaces/product.interface';
import { ProductsService } from '../../../services/products.service';
import { CdkDragDrop, DragDropModule, moveItemInArray } from '@angular/cdk/drag-drop';

interface Column {
  field: string;
  header: string;
}

// Visual Grid Builder Interfaces
interface GridBuilderItem {
  id: number;
  colStart: number;
  rowStart: number;
  colSpan: number;
  rowSpan: number;
}

@Component({
  selector: 'app-featured-collections-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TableModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    ToggleSwitchModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    TextareaModule,
    CardModule,
    DividerModule,
    UploadFilesComponent,
    DropdownModule,
    InputNumberModule,
    AccordionModule,
    TabViewModule,
    PanelModule,
    OrderListModule,
    SliderModule,
    ColorPickerModule,
    SelectButtonModule,
    TooltipModule,
    RadioButtonModule,
    DragDropModule
  ],
  templateUrl: './featured-collections-list.component.html',
  styleUrls: ['./featured-collections-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class FeaturedCollectionsListComponent extends ComponentBase implements OnInit {
  featuredCollectionForm!: FormGroup;
  featuredCollectionDialog = false;
  submitted = false;

  // Alignment Options
  justifyContentOptions = [
    { label: 'Center', value: 'center' },
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' },
    { label: 'Space Between', value: 'between' },
    { label: 'Space Around', value: 'around' },
    { label: 'Space Evenly', value: 'evenly' }
  ];

  alignItemsOptions = [
    { label: 'Stretch', value: 'stretch' },
    { label: 'Center', value: 'center' },
    { label: 'Start', value: 'start' },
    { label: 'End', value: 'end' }
  ];

  heightModeOptions = [
    { label: 'Auto (Content Based)', value: 'auto' },
    { label: 'Fixed Height', value: 'fixed' },
    { label: 'Minimum Height', value: 'min' },
    { label: 'Maximum Height', value: 'max' },
    { label: 'Aspect Ratio', value: 'aspect-ratio' }
  ];

  aspectRatioOptions = [
    { label: '16:9 (Widescreen)', value: '16/9' },
    { label: '4:3 (Standard)', value: '4/3' },
    { label: '1:1 (Square)', value: '1/1' },
    { label: '21:9 (Ultrawide)', value: '21/9' },
    { label: '3:2 (Photo)', value: '3/2' },
    { label: '2:1 (Panoramic)', value: '2/1' }
  ];

  // Grid Presets - User-friendly!
  gridPresets = [
    {
      id: 'single',
      name: 'Single Column',
      description: 'One full-width item',
      icon: 'pi-stop',
      preview: '┌────────┐\n│   1    │\n└────────┘',
      gridCols: { sm: 1, md: 1, lg: 1, xl: 1 }
    },
    {
      id: 'two',
      name: 'Two Columns',
      description: 'Two equal columns',
      icon: 'pi-pause',
      preview: '┌────┬────┐\n│ 1  │ 2  │\n└────┴────┘',
      gridCols: { sm: 1, md: 2, lg: 2, xl: 2 }
    },
    {
      id: 'three',
      name: 'Three Columns',
      description: 'Three equal columns',
      icon: 'pi-bars',
      preview: '┌──┬──┬──┐\n│1 │2 │3 │\n└──┴──┴──┘',
      gridCols: { sm: 1, md: 2, lg: 3, xl: 3 }
    },
    {
      id: 'four',
      name: 'Four Columns',
      description: 'Four equal columns',
      icon: 'pi-th-large',
      preview: '┌─┬─┬─┬─┐\n│1│2│3│4│\n└─┴─┴─┴─┘',
      gridCols: { sm: 2, md: 2, lg: 4, xl: 4 }
    },
    {
      id: 'featured',
      name: 'Featured Layout',
      description: 'One large + two small',
      icon: 'pi-window-maximize',
      preview: '┌────────┬──┐\n│   1    │2 │\n│        ├──┤\n│        │3 │\n└────────┴──┘',
      gridCols: { sm: 1, md: 2, lg: 2, xl: 2 }
    }
  ];

  selectedPreset = signal<string>('three');

  // Visual Style Options
  shadowOptions = [
    { label: 'None', value: 'shadow-none' },
    { label: 'Small', value: 'shadow-sm' },
    { label: 'Medium', value: 'shadow-md' },
    { label: 'Large', value: 'shadow-lg' },
    { label: 'Extra Large', value: 'shadow-xl' }
  ];

  selectedFeaturedCollections: IFeaturedCollection[] = [];
  loading = signal(false);
  featuredCollections = signal<IFeaturedCollection[]>([]);
  expandedCollectionIndex = signal<number | null>(null);
  categories = signal<ICategory[]>([]);
  brands = signal<IBrand[]>([]);
  packages = signal<IPackage[]>([]);
  products = signal<IProduct[]>([]);
  @ViewChild('dt') dt: Table | undefined;
  
  cols: Column[] = [
    { field: 'sectionSubtitle', header: 'Subtitle' },
    { field: 'sectionTitle', header: 'Title' },
    { field: 'description', header: 'Description' },
    { field: 'collections', header: 'Collections Count' },
    { field: 'isActive', header: 'Status' },
    { field: 'createdAt', header: 'Created At' }
  ];

  // ═══════════════════════════════════════════════════════════
  // 🎨 INTERACTIVE COLLECTIONS RESIZE
  // ═══════════════════════════════════════════════════════════
  isResizingCollection = false;
  resizingCollectionIndex = -1;
  private resizeStartX = 0;
  private resizeStartColSpan = 0;
  private columnWidth = 150;

  constructor(
    private fb: FormBuilder,
    private featuredCollectionsService: FeaturedCollectionsService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private packageService: PackageService,
    private productService: ProductsService
  ) {
    super();
  }

  ngOnInit() {
    this.initForm();
    this.loadFeaturedCollections();
    this.loadCategories();
    this.loadProducts();
    this.loadBrands();
    this.loadPackages();
  } 

  initForm() {
    this.featuredCollectionForm = this.fb.group({
      sectionSubtitle: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(2)]],
        ar: ['', [Validators.required, Validators.minLength(2)]]
      }),
      sectionTitle: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(2)]],
        ar: ['', [Validators.required, Validators.minLength(2)]]
      }),
      description: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(10)]],
        ar: ['', [Validators.required, Validators.minLength(10)]]
      }),
      isActive: [true],
      collections: this.fb.array([]),
      gridConfig: this.fb.group({
        gridCols: this.fb.group({
          sm: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
          md: [2, [Validators.min(1), Validators.max(12)]],
          lg: [3, [Validators.min(1), Validators.max(12)]],
          xl: [4, [Validators.min(1), Validators.max(12)]]
        }),
        gridRows: this.fb.group({
          sm: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
          md: [1, [Validators.min(1), Validators.max(12)]],
          lg: [1, [Validators.min(1), Validators.max(12)]],
          xl: [1, [Validators.min(1), Validators.max(12)]]
        }),
        colSpans: this.fb.array([]),
        rowSpans: this.fb.array([]),
        gap: [4, [Validators.min(0), Validators.max(96)]],
        rowHeight: ['auto'],
        justifyContent: ['center'],
        alignItems: ['stretch'],
        heightMode: ['min'],
        height: ['400px'],
        aspectRatio: [''],
        width: [''],
        parentCustomStyle: [''], // Changed to string (textarea)
        itemsCustomStyle: this.fb.array([])
      })
    });
  }

  get collectionsArray(): FormArray {
    return this.featuredCollectionForm.get('collections') as FormArray;
  }

  get gridConfigGroup(): FormGroup {
    return this.featuredCollectionForm.get('gridConfig') as FormGroup;
  }

  get gridColsGroup(): FormGroup {
    return this.gridConfigGroup?.get('gridCols') as FormGroup;
  }

  get colSpansArray(): FormArray {
    return this.gridConfigGroup?.get('colSpans') as FormArray;
  }

  get rowSpansArray(): FormArray {
    return this.gridConfigGroup?.get('rowSpans') as FormArray;
  }

  getColSpanGroup(index: number): FormGroup {
    if (index < 0 || index >= this.colSpansArray.length) {
      // Return a default group to prevent errors
      return this.fb.group({
        sm: [1],
        md: [2],
        lg: [2],
        xl: [2]
      });
    }
    return this.colSpansArray.at(index) as FormGroup;
  }

  getRowSpanGroup(index: number): FormGroup {
    if (index < 0 || index >= this.rowSpansArray.length) {
      // console.error(`Invalid index for rowSpan: ${index}. Array length: ${this.rowSpansArray.length}`);
      // Return a default group to prevent errors
      return this.fb.group({
        sm: [1],
        md: [1],
        lg: [1],
        xl: [1]
      });
    }
    return this.rowSpansArray.at(index) as FormGroup;
  }

  get itemsCustomStyleArray(): FormArray {
    return this.gridConfigGroup?.get('itemsCustomStyle') as FormArray;
  }

  get parentCustomStyleControl(): FormControl {
    return this.gridConfigGroup?.get('parentCustomStyle') as FormControl;
  }

  getItemCustomStyleControl(index: number): FormControl {
    if (index < 0 || index >= this.itemsCustomStyleArray.length) {
      return this.fb.control('');
    }
    return this.itemsCustomStyleArray.at(index) as FormControl;
  }


  addCollection() {
    const collectionGroup = this.fb.group({
      title: this.fb.group({
        en: [''],
        ar: ['']
      }),
      description: this.fb.group({
        en: [''],
        ar: ['']
      }),
      image: [null, [Validators.required]],
      buttonText: this.fb.group({
        en: ['', [Validators.required, Validators.minLength(2)]],
        ar: ['', [Validators.required, Validators.minLength(2)]]
      }),
      buttonLink: ['', [Validators.required]]
    });
    
    // Add default responsive colSpan first
    const defaultColSpan = this.fb.group({
      sm: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      md: [2, [Validators.min(1), Validators.max(12)]],
      lg: [2, [Validators.min(1), Validators.max(12)]],
      xl: [2, [Validators.min(1), Validators.max(12)]]
    });
    
    // Add default responsive rowSpan
    const defaultRowSpan = this.fb.group({
      sm: [1, [Validators.required, Validators.min(1), Validators.max(12)]],
      md: [1, [Validators.min(1), Validators.max(12)]],
      lg: [1, [Validators.min(1), Validators.max(12)]],
      xl: [1, [Validators.min(1), Validators.max(12)]]
    });
    
    // Add default item custom style (textarea)
    const defaultItemStyle = this.fb.control('');
    
    // Add all related items together to maintain synchronization
    this.colSpansArray.push(defaultColSpan);
    this.rowSpansArray.push(defaultRowSpan);
    this.itemsCustomStyleArray.push(defaultItemStyle);
    this.collectionsArray.push(collectionGroup);
    
    // Set collection index after adding
    const currentIndex = this.collectionsArray.length - 1;
    (collectionGroup as any).collectionIndex = currentIndex;
    
    // Expand the newly added collection
    this.expandedCollectionIndex.set(currentIndex);
    
    // Mark form as touched to trigger validation
    collectionGroup.markAllAsTouched();
  }

  removeCollection(index: number) {
    // Validate index
    if (index < 0 || index >= this.collectionsArray.length) {
      return;
    }

    // Remove from all arrays simultaneously to maintain synchronization
    // This ensures that all related data (collections, colSpans, rowSpans, itemsCustomStyle) stay aligned
    if (this.collectionsArray.length > index) {
      this.collectionsArray.removeAt(index);
    }
    
    if (this.colSpansArray.length > index) {
      this.colSpansArray.removeAt(index);
    }
    
    if (this.rowSpansArray.length > index) {
      this.rowSpansArray.removeAt(index);
    }
    
    if (this.itemsCustomStyleArray.length > index) {
      this.itemsCustomStyleArray.removeAt(index);
    }

    // Mark form as touched to trigger validation
    this.collectionsArray.markAsTouched();
    
    // Reset expanded index if the removed collection was expanded
    if (this.expandedCollectionIndex() === index) {
      this.expandedCollectionIndex.set(null);
    } else if (this.expandedCollectionIndex() !== null && this.expandedCollectionIndex()! > index) {
      // Adjust expanded index if a collection before it was removed
      this.expandedCollectionIndex.set(this.expandedCollectionIndex()! - 1);
    }

  }
  getControlImage(index: number): FormControl {
    const control = this.collectionsArray.at(index).get('image') as FormControl;
    // Ensure the control is properly initialized
    if (!control) {
    }
    return control;
  }
  trackByFn(index: number, item: AbstractControl): any {
    // Use a unique identifier if available, otherwise use index
    const control = item as FormGroup;
    if (control && (control as any).collectionIndex !== undefined) {
      return (control as any).collectionIndex;
    }
    // Fallback: use the control itself as the track key
    return control || index;
  }

  trackByIndex(index: number): number {
    return index;
  }

  getImageControl(collectionGroup: AbstractControl): FormControl {
    return collectionGroup.get('image') as FormControl;
  }

  getCollectionIndex(collectionGroup: FormGroup): number {
    // First try to get the index from the collection group itself
    if ((collectionGroup as any).collectionIndex !== undefined) {
      return (collectionGroup as any).collectionIndex;
    }
    // Fallback to finding the index in the array
    return this.collectionsArray.controls.findIndex(control => control === collectionGroup);
  }

  loadProducts() {
    this.productService.getProductsList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BaseResponse<IProduct[]>) => {
          this.products.set(response.data);
        },
      });
  }
  loadCategories() {
    this.categoryService.listCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BaseResponse<ICategory[]>) => {
          this.categories.set(response.data);
        },
        error: (error) => {
        }
      });
  }

  loadBrands() {
    this.brandService.listBrands()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BaseResponse<IBrand[]>) => {
          this.brands.set(response.data);
        },
        error: (error) => {
        }
      });
  }

  loadPackages() {

    this.packageService.getPackagesList()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BaseResponse<IPackage[]>) => {
          this.packages.set(response.data);
        },
      });
  }

  loadFeaturedCollections() {
    this.loading.set(true);
    this.featuredCollectionsService.getFeaturedCollections()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response: BaseResponse<IFeaturedCollection[]>) => {
          this.featuredCollections.set(response.data);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load featured collections'
          });
        }
      });
  }

  openNew() {
    this.selectedFeaturedCollections = [];
    this.featuredCollectionForm.reset();
    this.submitted = false;
    this.featuredCollectionDialog = true;
    this.collectionsArray.clear();
    this.colSpansArray.clear();
    this.rowSpansArray.clear();
    this.itemsCustomStyleArray.clear();
    this.parentCustomStyleControl.reset();
    // Set default grid config
    this.gridConfigGroup.patchValue({
      gridCols: {
        sm: 1,
        md: 2,
        lg: 3,
        xl: 4
      },
      gridRows: {
        sm: 1,
        md: 1,
        lg: 1,
        xl: 1
      },
      gap: 4,
      rowHeight: 'auto',
      justifyContent: 'center',
      alignItems: 'stretch',
      heightMode: 'min',
      height: '400px',
      aspectRatio: '',
      width: '',
      parentCustomStyle: '',
      itemsCustomStyle: []
    });
    this.addCollection(); // Add at least one collection
  }

  editFeaturedCollection(featuredCollection: IFeaturedCollection) {
    this.featuredCollectionForm.reset();
    // Clear all arrays to ensure clean state
    this.collectionsArray.clear();
    this.colSpansArray.clear();
    this.rowSpansArray.clear();
    this.itemsCustomStyleArray.clear();
    this.parentCustomStyleControl.reset();
    this.expandedCollectionIndex.set(null);
    
    // Populate collections array with proper synchronization
    featuredCollection.collections.forEach((collection, index) => {
      // Create collection group
      const collectionGroup = this.fb.group({
        title: this.fb.group({
          en: [collection.title?.en || ''],
          ar: [collection.title?.ar || '']
        }),
        description: this.fb.group({
          en: [collection.description?.en || ''],
          ar: [collection.description?.ar || '']
        }),
        image: [collection.image || null, collection.image ? [] : [Validators.required]],
        buttonText: this.fb.group({
          en: [collection.buttonText?.en || ''],
          ar: [collection.buttonText?.ar || '']
        }),
        buttonLink: [collection.buttonLink || '']
      });
      
      // Create corresponding colSpan group
      const colSpan = featuredCollection.gridConfig?.colSpans?.[index] || { sm: 1, md: 2, lg: 2, xl: 2 };
      const colSpanGroup = this.fb.group({
        sm: [colSpan.sm || 1, [Validators.required, Validators.min(1), Validators.max(12)]],
        md: [colSpan.md || 2, [Validators.min(1), Validators.max(12)]],
        lg: [colSpan.lg || 2, [Validators.min(1), Validators.max(12)]],
        xl: [colSpan.xl || 2, [Validators.min(1), Validators.max(12)]]
      });
      
      // Create corresponding rowSpan group
      const rowSpan = featuredCollection.gridConfig?.rowSpans?.[index] || { sm: 1, md: 1, lg: 1, xl: 1 };
      const rowSpanGroup = this.fb.group({
        sm: [rowSpan.sm || 1, [Validators.required, Validators.min(1), Validators.max(12)]],
        md: [rowSpan.md || 1, [Validators.min(1), Validators.max(12)]],
        lg: [rowSpan.lg || 1, [Validators.min(1), Validators.max(12)]],
        xl: [rowSpan.xl || 1, [Validators.min(1), Validators.max(12)]]
      });
      
      // Create corresponding item custom style control
      const itemStyle = featuredCollection.gridConfig?.itemsCustomStyle?.[index];
      let itemStyleText = '';
      if (typeof itemStyle === 'string') {
        itemStyleText = itemStyle; // Already a string (new format)
      } else if (itemStyle && typeof itemStyle === 'object') {
        itemStyleText = this.objectToCssText(itemStyle); // Convert object to string (backward compatibility)
      }
      const itemStyleControl = this.fb.control(itemStyleText);
      
      // Add all related items together to maintain synchronization
      this.colSpansArray.push(colSpanGroup);
      this.rowSpansArray.push(rowSpanGroup);
      this.itemsCustomStyleArray.push(itemStyleControl);
      this.collectionsArray.push(collectionGroup);
      
      // Set collection index after adding
      (collectionGroup as any).collectionIndex = index;
    });

    // Set parent custom style - handle both string and object (for backward compatibility)
    const parentCustomStyleControl = this.gridConfigGroup.get('parentCustomStyle') as FormControl;
    if (featuredCollection.gridConfig?.parentCustomStyle) {
      if (typeof featuredCollection.gridConfig.parentCustomStyle === 'string') {
        parentCustomStyleControl.setValue(featuredCollection.gridConfig.parentCustomStyle);
      } else {
        // If it's an object (old format), convert to string
        const cssText = this.objectToCssText(featuredCollection.gridConfig.parentCustomStyle);
        parentCustomStyleControl.setValue(cssText);
      }
    } else {
      parentCustomStyleControl.setValue('');
    }

    this.featuredCollectionForm.patchValue({
      sectionSubtitle: featuredCollection.sectionSubtitle,
      sectionTitle: featuredCollection.sectionTitle,
      description: featuredCollection.description,
      isActive: featuredCollection.isActive,
      gridConfig: {
        gridCols: featuredCollection.gridConfig?.gridCols || { sm: 1, md: 2, lg: 3, xl: 4 },
        gridRows: featuredCollection.gridConfig?.gridRows || { sm: 1, md: 1, lg: 1, xl: 1 },
        justifyContent: featuredCollection.gridConfig?.justifyContent || 'center',
        alignItems: featuredCollection.gridConfig?.alignItems || 'stretch',
        heightMode: featuredCollection.gridConfig?.heightMode || 'min',
        height: featuredCollection.gridConfig?.height || '400px',
        aspectRatio: featuredCollection.gridConfig?.aspectRatio || '',
        width: featuredCollection.gridConfig?.width || '',
        parentCustomStyle: featuredCollection.gridConfig?.parentCustomStyle 
          ? (typeof featuredCollection.gridConfig.parentCustomStyle === 'string' 
              ? featuredCollection.gridConfig.parentCustomStyle 
              : this.objectToCssText(featuredCollection.gridConfig.parentCustomStyle))
          : '',
        itemsCustomStyle: featuredCollection.gridConfig?.itemsCustomStyle 
          ? featuredCollection.gridConfig.itemsCustomStyle.map((itemStyle: any) => 
              typeof itemStyle === 'string' ? itemStyle : this.objectToCssText(itemStyle)
            ) 
          : [],
        gap: featuredCollection.gridConfig?.gap || 4,
        rowHeight: featuredCollection.gridConfig?.rowHeight || 'auto'
      }
    });
    
    this.collectionsArray.controls.forEach((control, i) => {
      (control as any).collectionIndex = i;
    });
    this.selectedFeaturedCollections = [featuredCollection];
    this.featuredCollectionDialog = true;
  }

  deleteFeaturedCollection(featuredCollection: IFeaturedCollection) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${featuredCollection.sectionTitle}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.featuredCollectionsService.deleteFeaturedCollection(featuredCollection._id)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Featured Collection Deleted',
                life: 3000
              });
              this.loadFeaturedCollections();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete featured collection'
              });
            }
          });
      }
    });
  }

  toggleActive(featuredCollection: IFeaturedCollection) {
    this.featuredCollectionsService.toggleActive(featuredCollection._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BaseResponse<IFeaturedCollection>) => {
          const updatedCollection = response.data;
          const collections = this.featuredCollections();
          const index = collections.findIndex(c => c._id === updatedCollection._id);
          if (index !== -1) {
            collections[index] = updatedCollection;
            this.featuredCollections.set([...collections]);
          }
          
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: `Featured Collection ${updatedCollection.isActive ? 'Activated' : 'Deactivated'}`,
            life: 3000
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to toggle featured collection status'
          });
        }
      });
  }

  hideDialog() {
    this.featuredCollectionDialog = false;
    this.submitted = false;
  }

  saveFeaturedCollection() {
    this.submitted = true;
    if (this.featuredCollectionForm.valid && this.collectionsArray.length > 0) {
      // Build formData from FormControls directly to ensure we get the latest values
      const formData: any = {
        sectionSubtitle: this.featuredCollectionForm.get('sectionSubtitle')?.value,
        sectionTitle: this.featuredCollectionForm.get('sectionTitle')?.value,
        description: this.featuredCollectionForm.get('description')?.value,
        isActive: this.featuredCollectionForm.get('isActive')?.value,
        collections: [],
        gridConfig: this.featuredCollectionForm.get('gridConfig')?.value || {}
      };
      
      const existingCollections = this.selectedFeaturedCollections.length > 0
        ? this.selectedFeaturedCollections[0].collections
        : [];

      // Process collections directly from FormArray to ensure images are properly included
      for (let i = 0; i < this.collectionsArray.length; i++) {
        const collectionControl = this.collectionsArray.at(i);
        const imageControl = collectionControl.get('image');
        const imageValue = imageControl?.value;
        const originalIndex = (collectionControl as any).collectionIndex;
        
        // Log for debugging

        // Determine final image value:
        // - If imageControl has a value, use it.
        // - If it's null/undefined but this is an existing collection, fall back to the original image.
        let finalImage = imageValue;
        if ((finalImage === null || finalImage === undefined) && existingCollections && originalIndex !== undefined && originalIndex !== null) {
          const existing = existingCollections[originalIndex];
          if (existing && existing.image) {
            finalImage = existing.image;
          }
        }
        
        // Build collection object from FormControl values
        const collection = {
          title: collectionControl.get('title')?.value || {},
          description: collectionControl.get('description')?.value || {},
          image: finalImage !== undefined && finalImage !== null ? finalImage : null,
          buttonText: collectionControl.get('buttonText')?.value || {},
          buttonLink: collectionControl.get('buttonLink')?.value || ''
        };
        
        formData.collections.push(collection);
      }
      // Handle parentCustomStyle - keep as string, trim and set to undefined if empty
      if (formData.gridConfig?.parentCustomStyle) {
        if (typeof formData.gridConfig.parentCustomStyle === 'string') {
          const cssText = formData.gridConfig.parentCustomStyle.trim();
          formData.gridConfig.parentCustomStyle = cssText || undefined;
        } else {
          // If it's an object (for backward compatibility), convert to string
          formData.gridConfig.parentCustomStyle = this.objectToCssText(formData.gridConfig.parentCustomStyle) || undefined;
        }
      } else {
        formData.gridConfig.parentCustomStyle = undefined;
      }
      
      // Process colSpans directly from FormArray
      const colSpans: any[] = [];
      for (let i = 0; i < this.colSpansArray.length; i++) {
        const colSpanControl = this.colSpansArray.at(i);
        colSpans.push(colSpanControl.value);
      }
      formData.gridConfig.colSpans = colSpans.length > 0 ? colSpans : undefined;
      
      // Keep itemsCustomStyle as string array (Tailwind classes)
      const itemsStyles: string[] = [];
      for (let i = 0; i < this.itemsCustomStyleArray.length; i++) {
        const itemStyleControl = this.itemsCustomStyleArray.at(i);
        const itemStyleText = itemStyleControl.value;
        if (typeof itemStyleText === 'string' && itemStyleText.trim()) {
          itemsStyles.push(itemStyleText.trim());
        } else {
          itemsStyles.push('');
        }
      }
      formData.gridConfig.itemsCustomStyle = itemsStyles.length > 0 ? itemsStyles : undefined;
      
      // Handle width field - set to undefined if empty
      if (formData.gridConfig) {
        if (formData.gridConfig.width && typeof formData.gridConfig.width === 'string') {
          const widthValue = formData.gridConfig.width.trim();
          formData.gridConfig.width = widthValue || undefined;
        } else if (!formData.gridConfig.width) {
          formData.gridConfig.width = undefined;
        }
      }
      if (this.selectedFeaturedCollections.length > 0) {
        // Update existing featured collection
        const featuredCollection = this.selectedFeaturedCollections[0];
        this.featuredCollectionsService.updateFeaturedCollection(featuredCollection._id, formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: BaseResponse<IFeaturedCollection>) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Featured Collection Updated',
                life: 3000
              });
              this.hideDialog();
              this.loadFeaturedCollections();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update featured collection'
              });
            }
          });
      } else {
        // Create new featured collection
        this.featuredCollectionsService.createFeaturedCollection(formData)
          .pipe(takeUntil(this.destroy$))
          .subscribe({
            next: (response: BaseResponse<IFeaturedCollection>) => {
              this.messageService.add({
                severity: 'success',
                summary: 'Successful',
                detail: 'Featured Collection Created',
                life: 3000
              });
              this.hideDialog();
              this.loadFeaturedCollections();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to create featured collection'
              });
            }
          });
      }
    }
  }

  onGlobalFilter(table: Table, event: Event) {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

  getFieldError(fieldName: string): string {
    const field = this.featuredCollectionForm.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors?.['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors?.['pattern']) {
        return `${fieldName} must be a valid URL`;
      }
    }
    return '';
  }

  getCollectionFieldError(collectionIndex: number, fieldName: string): string {
    const collectionGroup = this.collectionsArray.at(collectionIndex);
    const field = collectionGroup.get(fieldName);
    if (field?.invalid && field?.touched) {
      if (field.errors?.['required']) {
        return `${fieldName} is required`;
      }
      if (field.errors?.['minlength']) {
        return `${fieldName} must be at least ${field.errors['minlength'].requiredLength} characters`;
      }
      if (field.errors?.['pattern']) {
        return `${fieldName} must be a valid URL`;
      }
    }
    return '';
  }

  getStatusSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusValue(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }

  // Convert CSS text to object
  cssTextToObject(cssText: string): Record<string, string> {
    const result: Record<string, string> = {};
    if (!cssText || !cssText.trim()) {
      return result;
    }
    
    // Split by semicolon and process each property
    const lines = cssText.split(';').map(line => line.trim()).filter(line => line);
    
    lines.forEach(line => {
      const colonIndex = line.indexOf(':');
      if (colonIndex > 0) {
        const key = line.substring(0, colonIndex).trim();
        const value = line.substring(colonIndex + 1).trim();
        if (key && value) {
          result[key] = value;
        }
      }
    });
    
    return result;
  }

  // Convert object to CSS text
  objectToCssText(obj: Record<string, string>): string {
    if (!obj || Object.keys(obj).length === 0) {
      return '';
    }
    
    return Object.keys(obj)
      .map(key => `${key}: ${obj[key]}`)
      .join('; ');
  }

  // Preview helper methods
  getPreviewGridClasses(): string {
    const gridCols = this.gridConfigGroup?.get('gridCols')?.value || { sm: 1, md: 2, lg: 3, xl: 4 };
    const classes: string[] = [];
    if (gridCols.sm) classes.push(`grid-cols-${gridCols.sm}`);
    if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`);
    if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`);
    if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`);
    return classes.join(' ');
  }

  getPreviewColSpanClasses(index: number): string {
    if (index < 0 || index >= this.colSpansArray.length) {
      return 'col-span-1 md:col-span-2 lg:col-span-2 xl:col-span-2';
    }
    const colSpans = this.colSpansArray?.at(index)?.value || { sm: 1, md: 2, lg: 2, xl: 2 };
    const classes: string[] = [];
    if (colSpans.sm) classes.push(`col-span-${colSpans.sm}`);
    if (colSpans.md) classes.push(`md:col-span-${colSpans.md}`);
    if (colSpans.lg) classes.push(`lg:col-span-${colSpans.lg}`);
    if (colSpans.xl) classes.push(`xl:col-span-${colSpans.xl}`);
    return classes.join(' ');
  }

  getPreviewRowSpanClasses(index: number): string {
    if (index < 0 || index >= this.rowSpansArray.length) {
      return 'row-span-1 md:row-span-1 lg:row-span-1 xl:row-span-1';
    }
    const rowSpans = this.rowSpansArray?.at(index)?.value || { sm: 1, md: 1, lg: 1, xl: 1 };
    const classes: string[] = [];
    if (rowSpans.sm) classes.push(`row-span-${rowSpans.sm}`);
    if (rowSpans.md) classes.push(`md:row-span-${rowSpans.md}`);
    if (rowSpans.lg) classes.push(`lg:row-span-${rowSpans.lg}`);
    if (rowSpans.xl) classes.push(`xl:row-span-${rowSpans.xl}`);
    return classes.join(' ');
  }

  getPreviewJustifyContentClass(): string {
    const justifyContent = this.gridConfigGroup?.get('justifyContent')?.value || 'center';
    const map: { [key: string]: string } = {
      'center': 'justify-center',
      'start': 'justify-start',
      'end': 'justify-end',
      'between': 'justify-between',
      'around': 'justify-around',
      'evenly': 'justify-evenly'
    };
    return map[justifyContent] || 'justify-center';
  }

  getPreviewAlignItemsClass(): string {
    const alignItems = this.gridConfigGroup?.get('alignItems')?.value || 'stretch';
    const map: { [key: string]: string } = {
      'center': 'items-center',
      'start': 'items-start',
      'end': 'items-end',
      'stretch': 'items-stretch'
    };
    return map[alignItems] || 'items-stretch';
  }

  getPreviewParentStyle(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    const width = this.gridConfigGroup?.get('width')?.value;
    const rowHeight = this.gridConfigGroup?.get('rowHeight')?.value;
    
    if (width && width.trim()) {
      styles['width'] = width.trim();
    }
    
    // Add row height (grid-auto-rows)
    if (rowHeight && rowHeight.trim() && rowHeight !== 'auto') {
      styles['grid-auto-rows'] = rowHeight.trim();
    }
    
    return styles;
  }

  getPreviewParentClass(): string {
    const classes: string[] = ['grid'];
    
    // Add grid columns for each breakpoint
    const gridCols = this.gridConfigGroup?.get('gridCols')?.value;
    if (gridCols) {
      if (gridCols.sm) classes.push(`grid-cols-${gridCols.sm}`);
      if (gridCols.md) classes.push(`md:grid-cols-${gridCols.md}`);
      if (gridCols.lg) classes.push(`lg:grid-cols-${gridCols.lg}`);
      if (gridCols.xl) classes.push(`xl:grid-cols-${gridCols.xl}`);
    }
    
    // Add grid rows for each breakpoint
    const gridRows = this.gridConfigGroup?.get('gridRows')?.value;
    if (gridRows) {
      if (gridRows.sm && gridRows.sm > 1) classes.push(`grid-rows-${gridRows.sm}`);
      if (gridRows.md && gridRows.md > 1) classes.push(`md:grid-rows-${gridRows.md}`);
      if (gridRows.lg && gridRows.lg > 1) classes.push(`lg:grid-rows-${gridRows.lg}`);
      if (gridRows.xl && gridRows.xl > 1) classes.push(`xl:grid-rows-${gridRows.xl}`);
    }
    
    // Add gap
    const gap = this.gridConfigGroup?.get('gap')?.value;
    if (gap !== undefined && gap !== null) {
      const gapClass = this.getGapClass(gap);
      if (gapClass) classes.push(gapClass);
    }
    
    // Add justify-content
    const justifyContent = this.gridConfigGroup?.get('justifyContent')?.value;
    if (justifyContent) {
      const justifyMap: { [key: string]: string } = {
        'center': 'justify-center',
        'start': 'justify-start',
        'end': 'justify-end',
        'between': 'justify-between',
        'around': 'justify-around',
        'evenly': 'justify-evenly'
      };
      const justifyClass = justifyMap[justifyContent];
      if (justifyClass) classes.push(justifyClass);
    }
    
    // Add align-items
    const alignItems = this.gridConfigGroup?.get('alignItems')?.value;
    if (alignItems) {
      const alignMap: { [key: string]: string } = {
        'center': 'items-center',
        'start': 'items-start',
        'end': 'items-end',
        'stretch': 'items-stretch'
      };
      const alignClass = alignMap[alignItems];
      if (alignClass) classes.push(alignClass);
    }
    
    // Add custom parent style
    const parentCustomStyle = this.gridConfigGroup?.get('parentCustomStyle')?.value;
    if (parentCustomStyle) {
      if (typeof parentCustomStyle === 'string' && parentCustomStyle.trim()) {
        classes.push(parentCustomStyle.trim());
      } else if (typeof parentCustomStyle === 'object') {
        // Backward compatibility: if it's an object, convert to string
        classes.push(this.objectToCssText(parentCustomStyle));
      }
    }
    
    return classes.join(' ');
  }
  
  private getGapClass(gap: number): string {
    // Support all Tailwind gap values (0-96)
    // Tailwind gap scale: 0 = 0px, 1 = 0.25rem (4px), 2 = 0.5rem (8px), 4 = 1rem (16px), etc.
    if (gap >= 0 && gap <= 96) {
      return `gap-${gap}`;
    }
    return 'gap-4'; // default fallback (1rem = 16px)
  }

  getPreviewHeightStyle(): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    const gridConfig = this.gridConfigGroup?.value;
    
    if (!gridConfig) return { 'min-height': '400px' };
    
    const mode = gridConfig.heightMode || 'min';
    const height = gridConfig.height || '400px';
    const aspectRatio = gridConfig.aspectRatio;

    switch (mode) {
      case 'fixed':
        styles['height'] = height;
        break;
      case 'min':
        styles['min-height'] = height;
        break;
      case 'max':
        styles['max-height'] = height;
        break;
      case 'aspect-ratio':
        if (aspectRatio) {
          styles['aspect-ratio'] = aspectRatio;
        } else {
          styles['min-height'] = height;
        }
        break;
      case 'auto':
      default:
        styles['min-height'] = height;
        break;
    }

    return styles;
  }

  getPreviewItemStyle(index: number): { [key: string]: string } {
    const styles: { [key: string]: string } = {};
    const gridConfig = this.gridConfigGroup?.value;
    
    // Apply height style
    const heightStyle = this.getPreviewHeightStyle();
    Object.assign(styles, heightStyle);
    
    return styles;
  }

  getPreviewItemClass(index: number): string {
    if (index >= 0 && index < this.itemsCustomStyleArray.length) {
      const itemsCustomStyle = this.itemsCustomStyleArray?.at(index)?.value;
      if (itemsCustomStyle) {
        if (typeof itemsCustomStyle === 'string' && itemsCustomStyle.trim()) {
          return itemsCustomStyle.trim();
        } else if (typeof itemsCustomStyle === 'object') {
          // Backward compatibility: if it's an object, convert to string
          return this.objectToCssText(itemsCustomStyle);
        }
      }
    }
    return '';
  }

  getPreviewItemContainerClasses(index: number): string {
    const classes: string[] = [];
    
    classes.push(this.getPreviewColSpanClasses(index));
    
    const itemClass = this.getPreviewItemClass(index);
    if (itemClass) {
      classes.push(itemClass);
    }
    
    return classes.filter(c => c).join(' ');
  }

  getPreviewGridWrapperClass(): string {
    return 'flex justify-center';
  }

  getPreviewGridContainerClass(): string {
    const width = this.gridConfigGroup?.get('width')?.value;
    
    const classes: string[] = [];
    
    if (!width || !width.trim()) {
      classes.push('max-w-[1922px]');
    }
    
    classes.push('mx-auto');
    
    return classes.join(' ');
  }

  getPreviewImageUrl(collectionGroup: AbstractControl): string | null {
    const imageValue = collectionGroup.get('image')?.value;
    if (!imageValue) return null;
    
    // If it's an object with filePath
    if (typeof imageValue === 'object' && imageValue.filePath) {
      return imageValue.filePath;
    }
    
    // If it's a string URL
    if (typeof imageValue === 'string') {
      return imageValue;
    }
    
    return null;
  }

  getPreviewImageAlt(collectionGroup: AbstractControl): string {
    const imageValue = collectionGroup.get('image')?.value;
    if (imageValue && typeof imageValue === 'object' && imageValue.fileName) {
      return imageValue.fileName;
    }
    return 'Collection image';
  }

  // ========================================
  // 🎨 NEW UX METHODS
  // ========================================

  /**
   * Apply Grid Preset - User-friendly way to set grid columns
   */
  applyGridPreset(presetId: string) {
    this.selectedPreset.set(presetId);
    const preset = this.gridPresets.find(p => p.id === presetId);
    if (preset) {
      this.gridConfigGroup?.get('gridCols')?.patchValue(preset.gridCols);
      
      // Show success message
      this.messageService.add({
        severity: 'success',
        summary: 'Layout Applied',
        detail: `${preset.name} layout has been applied`,
        life: 2000
      });
    }
  }

  /**
   * Drag & Drop Collections Reordering
   */
  onCollectionDrop(event: CdkDragDrop<any[]>) {
    const collectionsArray = this.collectionsArray;
    const colSpansArray = this.colSpansArray;
    const itemsCustomStyleArray = this.itemsCustomStyleArray;

    // Move items in all related arrays
    moveItemInArray(collectionsArray.controls, event.previousIndex, event.currentIndex);
    moveItemInArray(colSpansArray.controls, event.previousIndex, event.currentIndex);
    moveItemInArray(itemsCustomStyleArray.controls, event.previousIndex, event.currentIndex);

    // Update form arrays
    collectionsArray.setValue(collectionsArray.controls.map(c => c.value));
    colSpansArray.setValue(colSpansArray.controls.map(c => c.value));
    itemsCustomStyleArray.setValue(itemsCustomStyleArray.controls.map(c => c.value));

    this.messageService.add({
      severity: 'info',
      summary: 'Reordered',
      detail: 'Collection order updated',
      life: 2000
    });
  }

  /**
   * Get current preset ID based on gridCols values
   */
  getCurrentPreset(): string {
    const gridCols = this.gridConfigGroup?.get('gridCols')?.value;
    if (!gridCols) return this.selectedPreset();

    const preset = this.gridPresets.find(p => 
      p.gridCols.sm === gridCols.sm &&
      p.gridCols.md === gridCols.md &&
      p.gridCols.lg === gridCols.lg &&
      p.gridCols.xl === gridCols.xl
    );

    return preset?.id || this.selectedPreset();
  }

  // ═══════════════════════════════════════════════════════════
  // 🎨 INTERACTIVE COLLECTIONS RESIZE METHODS
  // ═══════════════════════════════════════════════════════════

  /**
   * Start resizing a collection - ENHANCED
   */
  startCollectionResize(event: MouseEvent | TouchEvent, collectionIndex: number): void {
    event.preventDefault();
    event.stopPropagation();


    this.isResizingCollection = true;
    this.resizingCollectionIndex = collectionIndex;

    const colSpanGroup = this.getColSpanGroup(collectionIndex);
    this.resizeStartColSpan = colSpanGroup.get('lg')?.value || 1;

    // Get the actual grid element to calculate column width
    const gridElement = document.querySelector('.collections-interactive-grid') as HTMLElement;
    if (gridElement) {
      const gridWidth = gridElement.offsetWidth;
      const gridCols = this.gridConfigGroup?.get('gridCols')?.value?.lg || 12;
      const gap = parseFloat(getComputedStyle(gridElement).gap) || 0;
      
      // Calculate actual column width including gap
      this.columnWidth = (gridWidth - (gap * (gridCols - 1))) / gridCols;
    } else {
      this.columnWidth = 150; // Fallback
    }

    if (event instanceof MouseEvent) {
      this.resizeStartX = event.clientX;
      document.addEventListener('mousemove', this.onCollectionResizeMove, { passive: false });
      document.addEventListener('mouseup', this.onCollectionResizeEnd);
    } else {
      this.resizeStartX = event.touches[0].clientX;
      document.addEventListener('touchmove', this.onCollectionResizeMove, { passive: false });
      document.addEventListener('touchend', this.onCollectionResizeEnd);
    }

    // Add visual feedback class
    document.body.style.cursor = 'nwse-resize';
    document.body.classList.add('resizing-active');
  }

  /**
   * Handle collection resize move - ENHANCED
   */
  private onCollectionResizeMove = (event: MouseEvent | TouchEvent): void => {
    if (!this.isResizingCollection || this.resizingCollectionIndex === -1) return;

    event.preventDefault(); // Prevent text selection

    const clientX = event instanceof MouseEvent ? event.clientX : event.touches[0].clientX;
    const deltaX = clientX - this.resizeStartX;


    // Calculate new span based on actual column width
    const colSpanDelta = Math.round(deltaX / this.columnWidth);
    const gridCols = this.gridConfigGroup?.get('gridCols')?.value;
    const maxColSpan = gridCols?.lg || 12;

    const newColSpan = Math.max(1, Math.min(this.resizeStartColSpan + colSpanDelta, maxColSpan));


    // Only update if span changed
    const colSpanGroup = this.getColSpanGroup(this.resizingCollectionIndex);
    const currentSpan = colSpanGroup.get('lg')?.value || 1;

    if (newColSpan !== currentSpan) {
      // Calculate ratio for proportional update
      const ratio = newColSpan / this.resizeStartColSpan;

      // Get original values
      const originalSm = this.resizeStartColSpan; // Simplified
      const originalMd = this.resizeStartColSpan;
      const originalXl = this.resizeStartColSpan;

      colSpanGroup.patchValue({
        sm: Math.max(1, Math.min(Math.round(originalSm * ratio), gridCols?.sm || 12)),
        md: Math.max(1, Math.min(Math.round(originalMd * ratio), gridCols?.md || 12)),
        lg: newColSpan,
        xl: Math.max(1, Math.min(Math.round(originalXl * ratio), gridCols?.xl || 12))
      }, { emitEvent: false }); // Don't emit to avoid performance issues
    }
  };

  /**
   * Handle collection resize end - ENHANCED
   */
  private onCollectionResizeEnd = (): void => {
    if (this.isResizingCollection) {

      this.isResizingCollection = false;
      const collectionIndex = this.resizingCollectionIndex;
      this.resizingCollectionIndex = -1;

      document.removeEventListener('mousemove', this.onCollectionResizeMove);
      document.removeEventListener('mouseup', this.onCollectionResizeEnd);
      document.removeEventListener('touchmove', this.onCollectionResizeMove);
      document.removeEventListener('touchend', this.onCollectionResizeEnd);

      // Remove visual feedback
      document.body.style.cursor = '';
      document.body.classList.remove('resizing-active');

      const colSpanGroup = this.getColSpanGroup(collectionIndex);
      const newSpan = colSpanGroup.get('lg')?.value;

      this.messageService.add({
        severity: 'success',
        summary: 'Resized!',
        detail: `Collection ${collectionIndex + 1} → ${newSpan} columns`,
        life: 2000
      });

    }
  };

  // ═══════════════════════════════════════════════════════════
  // 🗑️ DEPRECATED: Visual Grid Builder Methods (Not Used)
  // ═══════════════════════════════════════════════════════════

  /**
   * Generate grid cells array for template
   */
  getGridCells(): number[] {
    return [];
  }

  // Deprecated methods - kept for compatibility
  isGridCellOccupied(cellIndex: number): boolean { return false; }
  addGridItem(): void {}
  addGridItemAtPosition(cellIndex: number): void {}
  removeGridItem(index: number): void {}
  clearAllGridItems(): void {}
  resetVisualGrid(): void {}
  onVisualGridChange(): void {}
  startResize(event: MouseEvent | TouchEvent, itemIndex: number): void {}
  getGeneratedCode(): string { return ''; }
  copyGeneratedCode(): void {}

} 