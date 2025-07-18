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
    FallbackImgDirective
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
  
  @ViewChild('dt') dt: Table | undefined;
  
  cols: Column[] = [
    { field: 'image', header: 'Image' },
    { field: 'name', header: 'Name' },
    { field: 'slug', header: 'Slug' },
    { field: 'sortOrder', header: 'Sort Order' },
    { field: 'isActive', header: 'Status' },
    { field: 'productCount', header: 'Products' },
  ];

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
    this.loadCategories();
    this.listCategories();
  }

  buildForm() {
    this.categoryForm = this.fb.group({
      _id: [null],
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
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
          summary: 'Error',
          detail: 'Failed to load categories',
          life: 3000
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
          life: 3000
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
      name: category.name,
      slug: category.slug,
      description: category.description,
      parentId: category.parentId,
      image: category.image ? [category.image] : [],
      sortOrder: category.sortOrder,
      isActive: category.isActive
    });
    this.categoryDialog = true;
  }

  deleteCategory(category: ICategory) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${category.name}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.categoryService.deleteCategory(category._id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Category Deleted',
              life: 3000
            });
            this.loadCategories();
          },
          error: (err) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete category',
              life: 3000
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
    const image = this.formControlImage.value;
    // if image is array then take first image and if not then take image
    categoryData.image = Array.isArray(image) ? image[0] : image;
    const request = categoryData._id
      ? this.categoryService.updateCategory(categoryData._id, categoryData)
      : this.categoryService.createCategory(categoryData);

    request.subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: `Category ${categoryData._id ? 'Updated' : 'Created'}`,
          life: 3000
        });
        this.loadCategories();
        this.hideDialog();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${categoryData._id ? 'update' : 'create'} category`,
          life: 3000
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
}
