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
import { ICategory } from '../../../interfaces/category.interface';
import { IBrand } from '../../../interfaces/brand.interface';
import { IPackage } from '../../../interfaces/package.interface';
import { PackageService } from '../../../services/package.service';
import { IProduct } from '../../../interfaces/product.interface';
import { ProductsService } from '../../../services/products.service';

interface Column {
  field: string;
  header: string;
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
    PanelModule
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
        colSpans: this.fb.array([]),
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

  getColSpanGroup(index: number): FormGroup {
    if (index < 0 || index >= this.colSpansArray.length) {
      console.error(`Invalid index for colSpan: ${index}. Array length: ${this.colSpansArray.length}`);
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

  get itemsCustomStyleArray(): FormArray {
    return this.gridConfigGroup?.get('itemsCustomStyle') as FormArray;
  }

  get parentCustomStyleControl(): FormControl {
    return this.gridConfigGroup?.get('parentCustomStyle') as FormControl;
  }

  getItemCustomStyleControl(index: number): FormControl {
    if (index < 0 || index >= this.itemsCustomStyleArray.length) {
      console.error(`Invalid index for item custom style: ${index}. Array length: ${this.itemsCustomStyleArray.length}`);
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
    
    // Add default item custom style (textarea)
    const defaultItemStyle = this.fb.control('');
    
    // Add all related items together to maintain synchronization
    this.colSpansArray.push(defaultColSpan);
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
      console.error(`Invalid index: ${index}. Array length: ${this.collectionsArray.length}`);
      return;
    }

    // Remove from all arrays simultaneously to maintain synchronization
    // This ensures that all related data (collections, colSpans, itemsCustomStyle) stay aligned
    if (this.collectionsArray.length > index) {
      this.collectionsArray.removeAt(index);
    }
    
    if (this.colSpansArray.length > index) {
      this.colSpansArray.removeAt(index);
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

    console.log(this.collectionsArray.value);
  }
  getControlImage(index: number): FormControl {
    const control = this.collectionsArray.at(index).get('image') as FormControl;
    // Ensure the control is properly initialized
    if (!control) {
      console.error(`Image control not found for collection index ${index}`);
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
          console.error('Error loading categories:', error);
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
          console.error('Error loading brands:', error);
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
          console.error('Error loading featured collections:', error);
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
      
      // Create corresponding item custom style control
      const itemStyle = featuredCollection.gridConfig?.itemsCustomStyle?.[index] || {};
      const itemStyleText = this.objectToCssText(itemStyle);
      const itemStyleControl = this.fb.control(itemStyleText);
      
      // Add all related items together to maintain synchronization
      this.colSpansArray.push(colSpanGroup);
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
        itemsCustomStyle: featuredCollection.gridConfig?.itemsCustomStyle ? featuredCollection.gridConfig.itemsCustomStyle.map((itemStyle: any) => this.objectToCssText(itemStyle)) : []
      }
    });
    
    this.collectionsArray.controls.forEach((control, i) => {
      (control as any).collectionIndex = i;
    });
    console.log(this.featuredCollectionForm.value);
    this.selectedFeaturedCollections = [featuredCollection];
    console.log(this.selectedFeaturedCollections);
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
              console.error('Error deleting featured collection:', error);
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
          console.error('Error toggling featured collection:', error);
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
    console.log('Form value before processing:', this.featuredCollectionForm.value);
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
        console.log(`Collection ${i} image value:`, imageValue);
        console.log(`Collection ${i} full control value:`, collectionControl.value);

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
        
        console.log(`Processed collection ${i}:`, collection);
        formData.collections.push(collection);
      }
      
      console.log('Collections array length:', this.collectionsArray.length);
      console.log('FormData collections length:', formData.collections.length);
      console.log('Final formData before processing gridConfig:', JSON.stringify(formData, null, 2));
      
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
      
      // Convert itemsCustomStyle FormArray (strings) to array of objects
      const itemsStyles: Record<string, string>[] = [];
      for (let i = 0; i < this.itemsCustomStyleArray.length; i++) {
        const itemStyleControl = this.itemsCustomStyleArray.at(i);
        const itemStyleText = itemStyleControl.value;
        if (typeof itemStyleText === 'string' && itemStyleText.trim()) {
          const style = this.cssTextToObject(itemStyleText);
          if (Object.keys(style).length > 0) {
            itemsStyles.push(style);
          } else {
            itemsStyles.push({});
          }
        } else {
          itemsStyles.push({});
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
        console.log(formData);
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
              console.error('Error updating featured collection:', error);
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
              console.error('Error creating featured collection:', error);
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
    
    if (width && width.trim()) {
      styles['width'] = width.trim();
    }
    
    return styles;
  }

  getPreviewParentClass(): string {
    const parentCustomStyle = this.gridConfigGroup?.get('parentCustomStyle')?.value;
    
    if (parentCustomStyle) {
      if (typeof parentCustomStyle === 'string' && parentCustomStyle.trim()) {
        return parentCustomStyle.trim();
      } else if (typeof parentCustomStyle === 'object') {
        // Backward compatibility: if it's an object, convert to string
        return this.objectToCssText(parentCustomStyle);
      }
    }
    
    return '';
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

} 