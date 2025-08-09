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
import { InputNumberModule } from 'primeng/inputnumber';
import { TagModule } from 'primeng/tag';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { TextareaModule } from 'primeng/textarea';
import { Skeleton } from 'primeng/skeleton';
import { Paginator } from 'primeng/paginator';
import { ToggleSwitchModule } from 'primeng/toggleswitch';

import { IBrand } from '../../../../app/interfaces/brand.interface';
import { BrandService } from '../../../services/brand.service';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil, forkJoin } from 'rxjs';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';

interface Column {
  field: string;
  header: string;
}

@Component({
  selector: 'app-brand-list',
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
    InputNumberModule,
    ToggleSwitchModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    UploadFilesComponent,
    Paginator,
    ToggleSwitchModule,
    FallbackImgDirective
],
  templateUrl: './brand-list.component.html',
  styleUrls: ['./brand-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class BrandListComponent extends ComponentBase implements OnInit {
  brandForm!: FormGroup;
  brandDialog = false;
  submitted = false;
  selectedBrands: IBrand[] = [];
  loading = signal(false);
  brands = signal<IBrand[]>([]);
  pagination = signal({
    page: 1,
    limit: 5,
    total: 0
  });
  
  @ViewChild('dt') dt: Table | undefined;
  
  cols: Column[] = [
    { field: 'name', header: 'Name' },
    { field: 'slug', header: 'Slug' },
    { field: 'isActive', header: 'Status' },
    { field: 'productCount', header: 'Products' }
  ];

  constructor(
    private fb: FormBuilder,
    private brandService: BrandService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {
    super();
  }

  ngOnInit() {
    this.buildForm();
    this.loadBrands();
  }

  buildForm() {
    this.brandForm = this.fb.group({
      _id: [null],
      name: ['', Validators.required],
      slug: ['', Validators.required],
      description: [''],
      logo: [null],
      website: [''],
      isActive: [true]
    });
  }

  loadBrands(page: number = 0, limit: number = 5) {
    this.loading.set(true);
    this.brandService.getBrands({ 
      page: (page || 0) + 1, 
      limit: limit || 5 
    }).pipe(
      takeUntil(this.destroy$),
      finalize(() => this.loading.set(false))
    )
    .subscribe({
      next: (res: BaseResponse<{brands: IBrand[], pagination: pagination}>) => {
        this.brands.set(res.data.brands);
        this.pagination.set(res.data.pagination);
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load brands',
          life: 1000
        });
      }
    });
  }

  openNew() {
    this.brandForm.reset({
      isActive: true
    });
    this.submitted = false;
    this.brandDialog = true;
  }

  editBrand(brand: IBrand) {
    this.brandForm.patchValue({
      _id: brand._id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      logo: brand.logo ? [brand.logo] : [],
      website: brand.website,
      isActive: brand.isActive
    });
    this.brandDialog = true;
  }

  deleteSelected() {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the selected ${this.selectedBrands.length} brands?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        const deleteObservables = this.selectedBrands.map(brand => 
          this.brandService.deleteBrand(brand._id!)
        );

        forkJoin(deleteObservables).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Brands Deleted',
              life: 1000
            });
            this.selectedBrands = [];
            this.loadBrands();
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete brands',
              life: 1000
            });
          }
        });
      }
    });
  }

  deleteBrand(brand: IBrand) {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete ${brand.name}?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.brandService.deleteBrand(brand._id!).subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Brand Deleted',
              life: 1000
            });
            this.loadBrands();
          },
          error: (err: any) => {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to delete brand',
              life: 1000
            });
          }
        });
      }
    });
  }

  saveBrand() {
    this.submitted = true;
    
    if (this.brandForm.invalid) {
      return;
    }

    const brandData = this.brandForm.value;
    const logo = this.formControlLogo.value;
    // if logo is array then take first logo and if not then take logo
    brandData.logo = Array.isArray(logo) ? logo[0] : logo;
    
    const request = brandData._id
      ? this.brandService.updateBrand(brandData._id, brandData)
      : this.brandService.createBrand(brandData);

    request.subscribe({
      next: (res: any) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: `Brand ${brandData._id ? 'Updated' : 'Created'}`,
          life: 1000
        });
        this.loadBrands();
        this.hideDialog();
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: `Failed to ${brandData._id ? 'update' : 'create'} brand`,
          life: 1000
        });
      }
    });
  }

  hideDialog() {
    this.brandDialog = false;
    this.submitted = false;
  }

  onGlobalFilter(event: any) {
    if (this.dt) {
      this.dt.filterGlobal(event.target.value, 'contains');
    }
  }

  get formControlLogo() {
    return this.brandForm.get('logo') as FormControl;
  }
}
