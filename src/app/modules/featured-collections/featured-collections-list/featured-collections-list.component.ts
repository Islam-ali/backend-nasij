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
    DropdownModule
  ],
  templateUrl: './featured-collections-list.component.html',
  styleUrls: ['./featured-collections-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class FeaturedCollectionsListComponent extends ComponentBase implements OnInit {
  featuredCollectionForm!: FormGroup;
  featuredCollectionDialog = false;
  submitted = false;
  selectedFeaturedCollections: IFeaturedCollection[] = [];
  loading = signal(false);
  featuredCollections = signal<IFeaturedCollection[]>([]);
  queryParams = signal<any[]>([]);
  selectedQueryParams = signal<any>(null);
  categories = signal<ICategory[]>([]);
  brands = signal<IBrand[]>([]);
  packages = signal<IPackage[]>([]);
  selectedQueryParamValues = signal<{ [key: number]: any[] }>({});
  products = signal<IProduct[]>([]);
  listOfRoutes = signal<string[]>([
    '/shop',
    '/packages'
  ]);
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
    this.loadQueryParams();
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
      collections: this.fb.array([])
    });
  }

  get collectionsArray(): FormArray {
    return this.featuredCollectionForm.get('collections') as FormArray;
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
      buttonLink: ['', [Validators.required]],
      queryParamName: [null],
      queryParamValue: [null],
      queryParams: [{}]
    });
    
    // Add the collection group first
    this.collectionsArray.push(collectionGroup);
    
    // Add a unique identifier to the collection group
    const currentIndex = this.collectionsArray.length - 1;
    (collectionGroup as any).collectionIndex = currentIndex;
    
    // Then set up the image control monitoring with the correct index
    const imageControl = collectionGroup.get('image');
    if (imageControl) {
      // Use a closure to capture the current index
      (() => {
        const index = currentIndex;
        imageControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
          console.log(`Image changed for collection ${index}:`, value);
        });
      })();
    }
  }

  removeCollection(index: number) {
    this.collectionsArray.removeAt(index);
    // Update the collectionIndex for all remaining collections
    this.collectionsArray.controls.forEach((control, i) => {
      (control as any).collectionIndex = i;
    });
  }
  getControlImage(index: number): FormControl {
    const control = this.collectionsArray.at(index).get('image') as FormControl;
    // Ensure the control is properly initialized
    if (!control) {
      console.error(`Image control not found for collection index ${index}`);
    }
    return control;
  }
  trackByFn(index: number, item: any): number {
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

  loadQueryParams() {
    this.queryParams.set([
      { name: 'category', value: 'category' },
      { name: 'brand', value: 'brand' },
      { name: 'product', value: 'product' },
      { name: 'package', value: 'package' }
    ]);
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

  onQueryParamsChange(event: any, collectionIndex: number) {
    const selectedParam = event.value;
    if (selectedParam) {
      this.updateQueryParamValues(selectedParam, collectionIndex);
    } else {
      const currentValues = this.selectedQueryParamValues();
      delete currentValues[collectionIndex];
      this.selectedQueryParamValues.set({ ...currentValues });
    }
  }

  updateQueryParamValues(selectedParam: string, collectionIndex: number) {
    let values: any[] = [];
    
    switch (selectedParam) {
      case 'category':
        values = this.categories().map(cat => ({ name: cat.name.en + ' - ' + cat.name.ar, value: cat._id }));
        break;
      case 'brand':
        values = this.brands().map(brand => ({ name: brand.name, value: brand._id }));
        break;
      case 'product':
        values = this.products().map(product => ({ name: product.name.en + ' - ' + product.name.ar, value: product._id }));
        break;
      case 'package':
        values = this.packages().map(pkg => ({ name: pkg.name.en + ' - ' + pkg.name.ar, value: pkg._id }));
        break;
      default:
        values = [];
    }
    
    const currentValues = this.selectedQueryParamValues();
    currentValues[collectionIndex] = values;
    this.selectedQueryParamValues.set({ ...currentValues });
  }

  onQueryParamValueChange(event: any, collectionIndex: number) {
    const selectedValue = event.value;
    const collectionGroup = this.collectionsArray.at(collectionIndex);
    const selectedParam = collectionGroup.get('queryParamName')?.value;
    
    if (selectedParam && selectedValue) {
      const currentQueryParams = collectionGroup.get('queryParams')?.value || {};
      currentQueryParams[selectedParam] = selectedValue;
      collectionGroup.get('queryParams')?.setValue(currentQueryParams);
      collectionGroup.get('queryParamName')?.setValue(null);
      collectionGroup.get('queryParamValue')?.setValue(null);
    }
  }

  removeQueryParam(collectionIndex: number, paramKey: string) {
    const collectionGroup = this.collectionsArray.at(collectionIndex);
    const currentQueryParams = collectionGroup.get('queryParams')?.value || {};
    delete currentQueryParams[paramKey];
    collectionGroup.get('queryParams')?.setValue(currentQueryParams);
  }

  getQueryParamsKeys(queryParams: any): string[] {
    if (!queryParams || typeof queryParams !== 'object') {
      return [];
    }
    return Object.keys(queryParams);
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
    this.addCollection(); // Add at least one collection
  }

  editFeaturedCollection(featuredCollection: IFeaturedCollection) {
    this.featuredCollectionForm.reset();
    // Clear and populate collections array
    this.collectionsArray.clear();
    featuredCollection.collections.forEach((collection, index) => {
      const collectionGroup = this.fb.group({
        title: this.fb.group({
          en: [collection.title?.en || ''],
          ar: [collection.title?.ar || '']
        }),
        description: this.fb.group({
          en: [collection.description?.en || ''],
          ar: [collection.description?.ar || '']
        }),
        image: [collection.image],
        buttonText: this.fb.group({
          en: [collection.buttonText?.en || ''],
          ar: [collection.buttonText?.ar || '']
        }),
        buttonLink: [collection.buttonLink],
        queryParamName: [null],
        queryParamValue: [null],
        queryParams: [collection.queryParams || {}]
      });
      
      // Add the collection group first
      this.collectionsArray.push(collectionGroup);
      
      // Add a unique identifier to the collection group
      (collectionGroup as any).collectionIndex = index;
      
      // Then set up the image control monitoring with the correct index
      const imageControl = collectionGroup.get('image');
      if (imageControl) {
        // Use a closure to capture the current index
        (() => {
          const currentIndex = index;
          imageControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe(value => {
            console.log(`Image changed for existing collection ${currentIndex}:`, value);
          });
        })();
      }
    });

    this.featuredCollectionForm.patchValue({
      sectionSubtitle: featuredCollection.sectionSubtitle,
      sectionTitle: featuredCollection.sectionTitle,
      description: featuredCollection.description,
      isActive: featuredCollection.isActive
    });
    
    this.collectionsArray.controls.forEach((control, i) => {
      (control as any).collectionIndex = i;
    });
    console.log(this.featuredCollectionForm.value);
    debugger;
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
    console.log(this.featuredCollectionForm.value);
    if (this.featuredCollectionForm.valid && this.collectionsArray.length > 0) {
      const formData = this.featuredCollectionForm.value;
      formData.collections = formData.collections.map((collection: any) => {
        delete collection.queryParamName;
        delete collection.queryParamValue;
        return collection;
      });
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
} 