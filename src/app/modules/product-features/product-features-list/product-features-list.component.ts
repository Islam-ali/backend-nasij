import { Component, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { inject } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { MessageService, ConfirmationService } from 'primeng/api';
import { ProductFeaturesService } from '../../../services/product-features.service';
import { IProductFeature, IFilterRule, ISortingRule } from '../../../interfaces/product-feature.interface';
import { IProduct, ProductStatus } from '../../../interfaces/product.interface';
import { BaseResponse } from '../../../core/models/baseResponse';
import { environment } from '../../../../environments/environment';
import { CategoryService } from '../../../services/category.service';
import { BrandService } from '../../../services/brand.service';
import { ICategory } from '../../../interfaces/category.interface';
import { IBrand } from '../../../interfaces/brand.interface';
import { TextareaModule } from 'primeng/textarea';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-product-features-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    ToggleSwitchModule,
    ToastModule,
    ConfirmDialogModule,
    TextareaModule,
    TranslateModule,
    TooltipModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './product-features-list.component.html',
  styleUrls: ['./product-features-list.component.scss'],
})
export class ProductFeaturesListComponent implements OnInit, OnDestroy {
  features: IProductFeature[] = [];
  featureDialog = false;
  featureForm!: FormGroup;
  submitted = false;
  saving = false;
  loading = false;
  selectedFeature: IProductFeature | null = null;
  previewProducts: IProduct[] = [];
  showPreview = false;
  categories: ICategory[] = [];
  brands: IBrand[] = [];
  
  private destroy$ = new Subject<void>();

  translate = inject(TranslateService);

  // Available filter operators
  operatorOptions: any[] = [];
  sortFieldOptions: any[] = [];
  sortOrderOptions: any[] = [];
  filterFieldOptions: any[] = [];
  statusOptions: any[] = [];
  ProductStatus = ProductStatus;

  // TrackBy functions for better performance
  trackByFeature(index: number, feature: IProductFeature): string {
    return feature._id || index.toString();
  }

  trackByProduct(index: number, product: IProduct): string {
    return product._id || index.toString();
  }

  trackByFilter(index: number): number {
    return index;
  }

  constructor(
    private fb: FormBuilder,
    private featuresService: ProductFeaturesService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cdr: ChangeDetectorRef
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.initializeOptions();
    this.loadFeatures();
    this.loadCategories();
    this.loadBrands();
    
    this.translate.onLangChange.subscribe(() => {
      this.initializeOptions();
    });
  }

  initializeOptions(): void {
    this.operatorOptions = [
      { label: this.translate.instant('productFeature.operators.equals'), value: 'equals' },
      { label: this.translate.instant('productFeature.operators.in'), value: 'in' },
      { label: this.translate.instant('productFeature.operators.nin'), value: 'nin' },
      { label: this.translate.instant('productFeature.operators.gte'), value: 'gte' },
      { label: this.translate.instant('productFeature.operators.lte'), value: 'lte' },
      { label: this.translate.instant('productFeature.operators.ne'), value: 'ne' },
      { label: this.translate.instant('productFeature.operators.contains'), value: 'contains' },
      { label: this.translate.instant('productFeature.operators.exists'), value: 'exists' },
      { label: this.translate.instant('productFeature.operators.regex'), value: 'regex' },
    ];

    this.sortFieldOptions = [
      { label: this.translate.instant('productFeature.sortField.createdAt'), value: 'createdAt' },
      { label: this.translate.instant('productFeature.sortField.updatedAt'), value: 'updatedAt' },
      { label: this.translate.instant('productFeature.sortField.price'), value: 'price' },
      { label: this.translate.instant('productFeature.sortField.nameEn'), value: 'name.en' },
      { label: this.translate.instant('productFeature.sortField.nameAr'), value: 'name.ar' },
      { label: this.translate.instant('productFeature.sortField.stock'), value: 'stock' },
    ];

    this.sortOrderOptions = [
      { label: this.translate.instant('productFeature.sortOrder.asc'), value: 'asc' },
      { label: this.translate.instant('productFeature.sortOrder.desc'), value: 'desc' },
    ];

    this.filterFieldOptions = [
      { label: this.translate.instant('productFeature.filterField.category'), value: 'category' },
      { label: this.translate.instant('productFeature.filterField.brand'), value: 'brand' },
      { label: this.translate.instant('productFeature.filterField.price'), value: 'price' },
      { label: this.translate.instant('productFeature.filterField.stock'), value: 'stock' },
      { label: this.translate.instant('productFeature.filterField.status'), value: 'status' },
      { label: this.translate.instant('productFeature.filterField.isActive'), value: 'isActive' },
    ];

    this.statusOptions = [
      { label: this.translate.instant('product.statusActive'), value: ProductStatus.ACTIVE },
      { label: this.translate.instant('product.statusInactive'), value: ProductStatus.INACTIVE },
      { label: this.translate.instant('product.statusOutOfStock'), value: ProductStatus.OUT_OF_STOCK },
    ];
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  initForm(): void {
    this.featureForm = this.fb.group({
      title: this.fb.group({
        en: ['', Validators.required],
        ar: [''],
      }),
      description: this.fb.group({
        en: [''],
        ar: [''],
      }),
      limit: [10, [Validators.required, Validators.min(1)]],
      sorting: this.fb.group({
        field: ['createdAt', Validators.required],
        order: ['desc', Validators.required],
      }),
      filters: this.fb.array([]),
      isActive: [true],
      displayOrder: [1],
    });
  }

  get filtersArray(): FormArray {
    return this.featureForm.get('filters') as FormArray;
  }

  loadFeatures(): void {
    this.featuresService.getAll().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: BaseResponse<IProductFeature[]>) => {
        this.features = response.data;
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('productFeature.failedToLoad'),
        });
      },
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.categories = response.data.categories || [];
        // Force change detection for dropdown updates
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Failed to load categories:', error);
      },
    });
  }

  loadBrands(): void {
    this.brandService.getBrands().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.brands = response.data.brands || [];
        // Force change detection for dropdown updates
        this.cdr.detectChanges();
      },
      error: (error: any) => {
        console.error('Failed to load brands:', error);
      },
    });
  }

  openNew(): void {
    this.selectedFeature = null;
    this.submitted = false;

    // Reset form completely
    this.featureForm.reset();
    this.featureForm.patchValue({
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      limit: 10,
      sorting: { field: 'createdAt', order: 'desc' },
      isActive: true,
      displayOrder: this.getNextDisplayOrder(),
    });

    this.filtersArray.clear();
    this.previewProducts = [];
    this.showPreview = false;
    this.featureDialog = true;
  }

  private getNextDisplayOrder(): number {
    if (!this.features || this.features.length === 0) return 1;
    return Math.max(...this.features.map(f => f.displayOrder || 0)) + 1;
  }

  editFeature(feature: IProductFeature): void {
    this.selectedFeature = feature;
    this.submitted = false;

    // Reset form first
    this.featureForm.reset({
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      limit: 10,
      sorting: { field: 'createdAt', order: 'desc' },
      isActive: true,
      displayOrder: 1,
    });

    // Patch with feature data
    this.featureForm.patchValue({
      title: feature.title || { en: '', ar: '' },
      description: feature.description || { en: '', ar: '' },
      limit: feature.limit || 10,
      sorting: feature.sorting || { field: 'createdAt', order: 'desc' },
      isActive: feature.isActive !== undefined ? feature.isActive : true,
      displayOrder: feature.displayOrder || 1,
    });

    // Clear and repopulate filters
    this.filtersArray.clear();
    if (feature.filters && Array.isArray(feature.filters) && feature.filters.length > 0) {
      feature.filters.forEach((filter) => {
        this.addFilter(filter);
      });
    }

    this.previewProducts = [];
    this.showPreview = false;
    this.featureDialog = true;
  }

  addFilter(filter?: IFilterRule): void {
    const filterGroup = this.fb.group({
      field: [filter?.field || '', Validators.required],
      operator: [filter?.operator || 'equals', Validators.required],
      value: [filter?.value || ''],
    });
    this.filtersArray.push(filterGroup);
  }

  removeFilter(index: number): void {
    this.filtersArray.removeAt(index);
  }

  previewFeature(): void {
    if (this.featureForm.invalid) {
      this.messageService.add({
        severity: 'warning',
        summary: this.translate.instant('common.warning'),
        detail: this.translate.instant('common.formInvalid')
      });
      return;
    }

    const formValue = this.featureForm.value;
    this.loading = true;

    this.featuresService
      .previewProducts(formValue.filters, formValue.sorting, formValue.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BaseResponse<IProduct[]>) => {
          this.previewProducts = response.data || [];
          this.showPreview = true;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('productFeature.failedToPreview'),
          });
        },
        complete: () => {
          this.loading = false;
        }
      });
  }

  saveFeature(): void {
    this.submitted = true;

    if (this.featureForm.invalid) {
      this.messageService.add({
        severity: 'error',
        summary: this.translate.instant('common.error'),
        detail: this.translate.instant('common.formInvalid')
      });
      return;
    }

    const formData = this.featureForm.value;

    this.saving = true;

    if (this.selectedFeature && this.selectedFeature._id) {
      this.featuresService
        .update(this.selectedFeature._id, formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('common.success'),
              detail: this.translate.instant('productFeature.updatedSuccessfully'),
            });
            this.hideDialog();
            this.loadFeatures();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('common.error'),
              detail: this.translate.instant('productFeature.failedToUpdate'),
            });
            this.saving = false;
          },
          complete: () => {
            this.saving = false;
          }
        });
    } else {
      this.featuresService
        .create(formData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('common.success'),
              detail: this.translate.instant('productFeature.createdSuccessfully'),
            });
            this.hideDialog();
            this.loadFeatures();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('common.error'),
              detail: this.translate.instant('productFeature.failedToCreate'),
            });
            this.saving = false;
          },
          complete: () => {
            this.saving = false;
          }
        });
    }
  }

  getImageUrl(filePath: string): string {
    return `${environment.baseUrl}/${filePath}`;
  }

  deleteFeature(feature: IProductFeature): void {
    this.confirmationService.confirm({
      message: this.translate.instant('productFeature.confirmDelete', { title: feature.title.en }),
      header: this.translate.instant('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (feature._id) {
          this.featuresService
            .delete(feature._id)
            .pipe(takeUntil(this.destroy$))
            .subscribe({
              next: () => {
                this.messageService.add({
                  severity: 'success',
                  summary: this.translate.instant('common.success'),
                  detail: this.translate.instant('productFeature.deletedSuccessfully'),
                });
                this.loadFeatures();
              },
              error: (error) => {
                this.messageService.add({
                  severity: 'error',
                  summary: this.translate.instant('common.error'),
                  detail: this.translate.instant('productFeature.failedToDelete'),
                });
              },
            });
        }
      },
    });
  }

  hideDialog(): void {
    this.featureDialog = false;
    this.submitted = false;
    this.previewProducts = [];
    this.showPreview = false;
  }

  getFieldType(index: number): 'text' | 'category' | 'brand' | 'boolean' | 'status' {
    const field = this.filtersArray.at(index).get('field')?.value;
    if (field === 'category') return 'category';
    if (field === 'brand') return 'brand';
    if (field === 'status') return 'status';
    if (field === 'isActive' || field === 'isFeatured') return 'boolean';
    return 'text';
  }

  getCategoryOptions(): { label: string; value: string }[] {
    if (!this.categories || this.categories.length === 0) {
      return [];
    }
    return this.categories
      .filter(cat => cat._id && cat.isActive !== false)
      .map(cat => ({
        label: cat.name?.en || cat.name?.ar || cat._id || 'Unnamed',
        value: cat._id!
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  getBrandOptions(): { label: string; value: string }[] {
    if (!this.brands || this.brands.length === 0) {
      return [];
    }
    return this.brands
      .filter(brand => brand._id && brand.isActive !== false)
      .map(brand => ({
        label: brand.name?.en || brand.name?.ar || brand._id || 'Unnamed',
        value: brand._id!
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }

  getBooleanOptions(): { label: string; value: boolean }[] {
    return [
      { label: this.translate.instant('common.yes'), value: true },
      { label: this.translate.instant('common.no'), value: false }
    ];
  }

  getStatusLabel(isActive: boolean): string {
    return isActive 
      ? this.translate.instant('common.active') 
      : this.translate.instant('common.inactive');
  }
}

