import { Component, OnInit, OnDestroy } from '@angular/core';
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
import { IProduct } from '../../../interfaces/product.interface';
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

  constructor(
    private fb: FormBuilder,
    private featuresService: ProductFeaturesService,
    private categoryService: CategoryService,
    private brandService: BrandService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
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
      { label: this.translate.instant('productFeature.filterField.isActive'), value: 'isActive' },
      { label: this.translate.instant('productFeature.filterField.isFeatured'), value: 'isFeatured' },
      { label: this.translate.instant('productFeature.filterField.tags'), value: 'tags' },
      { label: this.translate.instant('productFeature.filterField.nameEn'), value: 'name.en' },
      { label: this.translate.instant('productFeature.filterField.nameAr'), value: 'name.ar' },
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
        this.categories = response.data.categories;
      },
      error: (error: any) => {
        console.error('Failed to load categories:', error);
      },
    });
  }

  loadBrands(): void {
    this.brandService.getBrands().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: any) => {
        this.brands = response.data.brands;
      },
      error: (error: any) => {
        console.error('Failed to load brands:', error);
      },
    });
  }

  openNew(): void {
    this.selectedFeature = null;
    this.submitted = false;
    this.featureForm.reset({
      title: { en: '', ar: '' },
      description: { en: '', ar: '' },
      limit: 10,
      sorting: { field: 'createdAt', order: 'desc' },
      isActive: true,
      displayOrder: 1,
    });
    this.filtersArray.clear();
    this.previewProducts = [];
    this.showPreview = false;
    this.featureDialog = true;
  }

  editFeature(feature: IProductFeature): void {
    this.selectedFeature = feature;
    this.submitted = false;
    this.featureForm.patchValue({
      title: feature.title,
      description: feature.description || { en: '', ar: '' },
      limit: feature.limit,
      sorting: feature.sorting || { field: 'createdAt', order: 'desc' },
      isActive: feature.isActive,
      displayOrder: feature.displayOrder,
    });
    
    this.filtersArray.clear();
    if (feature.filters && feature.filters.length > 0) {
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
    const formValue = this.featureForm.value;
    this.featuresService
      .previewProducts(formValue.filters, formValue.sorting, formValue.limit)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: BaseResponse<IProduct[]>) => {
          this.previewProducts = response.data;
          this.showPreview = true;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('productFeature.failedToPreview'),
          });
        },
      });
  }

  saveFeature(): void {
    this.submitted = true;
    
    if (this.featureForm.invalid) {
      return;
    }

    const formData = this.featureForm.value;

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
          },
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
          },
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

  getFieldType(index: number): 'text' | 'category' | 'brand' | 'boolean' {
    const field = this.filtersArray.at(index).get('field')?.value;
    if (field === 'category') return 'category';
    if (field === 'brand') return 'brand';
    if (field === 'isActive' || field === 'isFeatured') return 'boolean';
    return 'text';
  }

  getCategoryOptions(): { label: string; value: string }[] {
    return this.categories
      .filter(cat => cat._id)
      .map(cat => ({
        label: cat.name.en || cat.name.ar || 'Unnamed',
        value: cat._id!
      }));
  }

  getBrandOptions(): { label: string; value: string }[] {
    return this.brands
      .filter(brand => brand._id)
      .map(brand => ({
        label: brand.name.en || brand.name.ar || 'Unnamed',
        value: brand._id!
      }));
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

