import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule, FormsModule, FormControl } from '@angular/forms';

// PrimeNG Services
import { MessageService, ConfirmationService } from 'primeng/api';

// PrimeNG Components
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { CalendarModule } from 'primeng/calendar';
import { DropdownModule } from 'primeng/dropdown';

// Services
import { BannerService } from '../../../services/banner.service';

// Interfaces
import { Banner, BannerButton } from '../../../interfaces/banner.interface';

// Components
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { BaseResponse } from '../../../core/models/baseResponse';
import { CategoryService } from '../../../services/category.service';
import { BrandService } from '../../../services/brand.service';
import { takeUntil } from 'rxjs';
import { ICategory } from '../../../interfaces/category.interface';
import { IBrand } from '../../../interfaces/brand.interface';
import { ComponentBase } from '../../../core/directives/component-base.directive';

@Component({
  selector: 'app-banner-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ToggleButtonModule,
    CalendarModule,
    DropdownModule,
    UploadFilesComponent
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './banner-list.component.html',
  styleUrls: ['./banner-list.component.scss']
})
export class BannerListComponent extends ComponentBase implements OnInit {
  banners = signal<Banner[]>([]);
  bannerDialog:boolean=false;
  deleteBannerDialog = signal(false);
  banner = signal<Banner | null>(null);
  submitted = signal(false);
  loading = signal(false);
  params = signal<any[]>([]);
  selectedparams = signal<any>(null);
  categories = signal<ICategory[]>([]);
  brands = signal<IBrand[]>([]);
  selectedQueryParamValues = signal<{ [key: number]: any[] }>({});
  bannerForm!: FormGroup;

  constructor(
    private bannerService: BannerService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private brandService: BrandService
    ) {
    super();
  }

  ngOnInit() {
    this.loadBanners();
    this.initForm();
    this.loadparams();
    this.loadCategories();
    this.loadBrands();
    }

  initForm() {
    this.bannerForm = this.fb.group({
      tag: ['', [Validators.required]],
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
      image: [null, [Validators.required]],
      isActive: [true],
      startDate: [null],
      endDate: [null],
      buttons: this.fb.array([])
    });
  }

  get buttonsArray(): FormArray {
    return this.bannerForm.get('buttons') as FormArray;
  }

  addButton() {
    const buttonGroup = this.fb.group({
      label: ['', [Validators.required]],
      url: ['', [Validators.required]],
      params: [{}],
      queryParamName: [null],
      queryParamValue: [null]
    });
    this.buttonsArray.push(buttonGroup);
  }

  removeButton(index: number) {
    this.buttonsArray.removeAt(index);
  }

  loadBanners() {
    this.loading.set(true);
    this.bannerService.getAllBanners().subscribe({
      next: (banners) => {
        this.banners.set(banners.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading banners:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load banners'
        });
        this.loading.set(false);
      }
    });
  }

  openNew() {
    this.banner.set(null);
    this.submitted.set(false);
    this.bannerDialog=true;
    this.bannerForm.reset();
    this.buttonsArray.clear();
    this.addButton(); // Add at least one button
  }

  editBanner(banner: Banner) {
    this.banner.set({ ...banner });
    this.bannerDialog=true;
    this.submitted.set(false);
    
    // Clear existing buttons
    this.buttonsArray.clear();
    
    // Add existing buttons
    banner.buttons.forEach(button => {
      const buttonGroup = this.fb.group({
        label: [button.label, [Validators.required]],
        url: [button.url, [Validators.required]],
        params: [button.params || {}],
        queryParamName: [null],
        queryParamValue: [null]
      });
      this.buttonsArray.push(buttonGroup);
    });

    this.bannerForm.patchValue({
      tag: banner.tag,
      title: banner.title,
      description: banner.description,
      image: banner.image,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate) : null,
      endDate: banner.endDate ? new Date(banner.endDate) : null
    });
  }

  deleteBanner(banner: Banner) {
    this.deleteBannerDialog.set(true);
    this.banner.set(banner);
  }

  confirmDelete() {
    if (this.banner()) {
      this.bannerService.deleteBanner(this.banner()!._id!).subscribe({
        next: () => {
          this.deleteBannerDialog.set(false);
          this.banner.set(null);
          this.messageService.add({
            severity: 'success',
            summary: 'Successful',
            detail: 'Banner Deleted',
            life: 3000
          });
          this.loadBanners();
        },
        error: (error) => {
          console.error('Error deleting banner:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete banner'
          });
        }
      });
    }
  }

  hideDialog() {
    this.bannerDialog=false;
    this.submitted.set(false);
  }

  saveBanner() {
    this.submitted.set(true);

    if (this.bannerForm.valid) {
      const bannerData = {
        ...this.bannerForm.value,
        buttons: this.buttonsArray.value.map((button: any) => {
            delete button.queryParamName;
            delete button.queryParamValue;
            return button;
        })
      };

      if (this.banner()!._id) {
        // Update existing banner
        this.bannerService.updateBanner(this.banner()!._id!, bannerData).subscribe({
          next: (updatedBanner) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Banner Updated',
              life: 3000
            });
            this.hideDialog();
            this.loadBanners();
          },
          error: (error) => {
            console.error('Error updating banner:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update banner'
            });
          }
        });
      } else {
        // Create new banner
        this.bannerService.createBanner(bannerData).subscribe({
          next: (newBanner) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Banner Created',
              life: 3000
            });
            this.hideDialog();
            this.loadBanners();
          },
          error: (error) => {
            console.error('Error creating banner:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create banner'
            });
          }
        });
      }
    }
  }

  toggleActive(banner: Banner) {
    this.bannerService.toggleBannerActive(banner._id!).subscribe({
      next: (updatedBanner) => {
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: `Banner ${updatedBanner.data.isActive ? 'Activated' : 'Deactivated'}`,
          life: 3000
        });
        this.loadBanners();
      },
      error: (error) => {
        console.error('Error toggling banner:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to toggle banner status'
        });
      }
    });
  }

  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive ? 'Active' : 'Inactive';
  }
  loadparams() {
    this.params.set([
      { name: 'category', value: 'category' },
      { name: 'brand', value: 'brand' },
      { name: 'product', value: 'product' }
    ]);
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

  onparamsChange(event: any, buttonIndex: number) {
    const selectedParam = event.value;
    if (selectedParam) {
      this.updateQueryParamValues(selectedParam, buttonIndex);
    } else {
      const currentValues = this.selectedQueryParamValues();
      delete currentValues[buttonIndex];
      this.selectedQueryParamValues.set({ ...currentValues });
    }
  }

  updateQueryParamValues(selectedParam: string, buttonIndex: number) {
    let values: any[] = [];
    
    switch (selectedParam) {
      case 'category':
        values = this.categories().map(cat => ({ name: cat.name, value: cat._id }));
        break;
      case 'brand':
        values = this.brands().map(brand => ({ name: brand.name, value: brand._id }));
        break;
      case 'product':
        // يمكن إضافة منتجات هنا إذا كان مطلوباً
        values = [];
        break;
      default:
        values = [];
    }
    
    const currentValues = this.selectedQueryParamValues();
    currentValues[buttonIndex] = values;
    this.selectedQueryParamValues.set({ ...currentValues });
  }

  onQueryParamValueChange(event: any, buttonIndex: number) {
    const selectedValue = event.value;
    const buttonGroup = this.buttonsArray.at(buttonIndex);
    const selectedParam = buttonGroup.get('queryParamName')?.value;
    
    if (selectedParam && selectedValue) {
      const currentparams = buttonGroup.get('params')?.value || {};
      currentparams[selectedParam] = selectedValue;
      buttonGroup.get('params')?.setValue(currentparams);
      buttonGroup.get('queryParamName')?.setValue(null);
      buttonGroup.get('queryParamValue')?.setValue(null);
    }
  }

  removeQueryParam(buttonIndex: number, paramKey: string) {
    const buttonGroup = this.buttonsArray.at(buttonIndex);
    const currentparams = buttonGroup.get('params')?.value || {};
    delete currentparams[paramKey];
    buttonGroup.get('params')?.setValue(currentparams);
  }

  getparamsKeys(params: any): string[] {
    if (!params || typeof params !== 'object') {
      return [];
    }
    return Object.keys(params);
  }
} 