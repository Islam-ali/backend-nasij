import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';

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
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';

import { ICategory } from '../../../../app/interfaces/category.interface';
import { CategoryService } from '../../../services/category.service';
import { UploadFilesComponent } from "../../../shared/components/fields/upload-files/upload-files.component";
import { TextareaModule } from 'primeng/textarea';
import { Paginator } from "primeng/paginator";
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { SupportedLanguage } from '../../../../app/interfaces/banner.interface';
import { environment } from '../../../../environments/environment';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { inject } from '@angular/core';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-catgory-list',
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
    TextareaModule,
    DialogModule,
    ConfirmDialogModule,
    DropdownModule,
    InputNumberModule,
    ToggleSwitchModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    UploadFilesComponent,
    Paginator,
    FallbackImgDirective,
    MultiLanguagePipe,
    TranslateModule
],
  templateUrl: './catgory-list.component.html',
  styleUrls: ['./catgory-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class CatgoryListComponent extends ComponentBase implements OnInit {
  categoryForm!: FormGroup;
  categoryDialog = false;
  submitted = false;
  selectedCategories: ICategory[] = [];
  loading = signal(false);
  categories = signal<ICategory[]>([]);
  pagination = signal({
    page: 1,
    limit: 5,
    total: 0
  });
  parentCategories: ICategory[] = [];
  
  // Language support
  currentLanguage = signal<SupportedLanguage>('en');
  languages = signal<{label: string, value: SupportedLanguage}[]>([
    { label: 'English', value: 'en' },
    { label: 'العربية', value: 'ar' }
  ]);
  translate = inject(TranslateService);
  
  @ViewChild('dt') dt: Table | undefined;
  
  cols: Column[] = [];

  constructor(
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
    this.updateColumns();
    this.translate.onLangChange.subscribe(() => {
      this.updateColumns();
    });
    this.loadCategories();
    this.listCategories();
  }

  updateColumns() {
    this.cols = [
      { field: 'image', header: this.translate.instant('category.image') },
      { field: 'name', header: this.translate.instant('common.name') },
      { field: 'slug', header: this.translate.instant('category.slug') },
      { field: 'sortOrder', header: this.translate.instant('category.sortOrder') },
      { field: 'isActive', header: this.translate.instant('category.status') },
      { field: 'productCount', header: this.translate.instant('category.products') },
    ];
  }

  getImageUrl(filePath: string): string {
    return `${environment.baseUrl}/${filePath}`;
}

  buildForm() {
    this.categoryForm = this.fb.group({
      _id: [null],
      name: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required]
      }),
      slug: this.fb.group({
        en: ['', Validators.required],
        ar: ['', Validators.required]
      }),
      description: this.fb.group({
        en: [''],
        ar: ['']
      }),
      parentId: [null],
      image: [null],
      sortOrder: [0, [Validators.required, Validators.min(0)]],
      isActive: [true]
    });
  }

  listCategories() {
    this.categoryService.listCategories().pipe(
      takeUntil(this.destroy$),
    )
      .subscribe({
      next: (res: any) => {
        this.parentCategories = res.data.filter((cat: ICategory) => !cat.parentId);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('category.failedToLoad'),
          life: 1000
        });
      }
    });
  }

  loadCategories(page: number = 0, limit: number = 5) {
    this.loading.set(true);
    this.categoryService.getCategories({ page: page + 1, limit: limit }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false))
    )
      .subscribe({
      next: (res: BaseResponse<{categories:ICategory[], pagination:pagination}>) => {
        this.categories.set(res.data.categories);
        this.pagination.set(res.data.pagination);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load categories',
          life: 1000
        });
      }
    });
  }

  openNew() {
    this.categoryForm.reset({
      sortOrder: 0,
      isActive: true
    });
    this.submitted = false;
    this.categoryDialog = true;
  }

  editCategory(category: ICategory) {
    this.categoryForm.patchValue({
      _id: category._id,
      name: {
        en: category.name.en,
        ar: category.name.ar
      },
      slug: {
        en: category.slug.en,
        ar: category.slug.ar
      },
      description: {
        en: category.description?.en || '',
        ar: category.description?.ar || ''
      },
      parentId: category.parentId,
      image: category.image,
      sortOrder: category.sortOrder,
      isActive: category.isActive
    });
    this.categoryDialog = true;
  }

  deleteCategory(category: ICategory) {
    const categoryName = category.name[this.currentLanguage()] || category.name.en || category.name.ar || '';
    this.confirmationService.confirm({
      message: this.translate.instant('category.confirmDelete', { name: categoryName }),
      header: this.translate.instant('common.confirm'),
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoryService.deleteCategory(category._id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('common.success'),
              detail: this.translate.instant('category.deletedSuccessfully'),
              life: 1000
            });
            this.loadCategories();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('common.error'),
              detail: this.translate.instant('category.failedToDelete'),
              life: 1000
            });
          }
        });
      }
    });
  }

  saveCategory() {
    this.submitted = true;
    
    if (this.categoryForm.invalid) {
      return;
    }

    const categoryData = this.categoryForm.value;
    const request = categoryData._id
      ? this.categoryService.updateCategory(categoryData._id, categoryData)
      : this.categoryService.createCategory(categoryData);

    request.subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.success'),
          detail: categoryData._id 
            ? this.translate.instant('category.updatedSuccessfully')
            : this.translate.instant('category.createdSuccessfully'),
          life: 1000
        });
        this.loadCategories();
        this.hideDialog();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: categoryData._id 
            ? this.translate.instant('category.failedToUpdate')
            : this.translate.instant('category.failedToCreate'),
          life: 1000
        });
      }
    });
  }

  hideDialog() {
    this.categoryDialog = false;
    this.submitted = false;
  }

  onGlobalFilter(event: any) {
    if (this.dt) {
      this.dt.filterGlobal(event.target.value, 'contains');
    }
  }

  get formControlImage() {
    return this.categoryForm.get('image') as FormControl;
  }

  // Language helper methods
  onLanguageChange(event: any) {
    this.currentLanguage.set(event.value);
  }

  // Helper for dropdown display
  getParentCategoryLabel(category: ICategory): string {
    return category.name[this.currentLanguage()] || category.name.en || '';
  }

  // Get avatar initial from category name
  getAvatarInitial(name: string): string {
    if (!name || name.trim().length === 0) {
      return '?';
    }
    // Get first letter and capitalize it
    return name.trim().charAt(0).toUpperCase();
  }
}
