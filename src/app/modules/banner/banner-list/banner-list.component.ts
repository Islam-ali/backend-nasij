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
import { Banner, SupportedLanguage } from '../../../interfaces/banner.interface';

// Components
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { GradientBuilderComponent } from '../../../shared/components/gradient-builder/gradient-builder.component';
import { BaseResponse } from '../../../core/models/baseResponse';
import { CategoryService } from '../../../services/category.service';
import { BrandService } from '../../../services/brand.service';
import { takeUntil } from 'rxjs';
import { ICategory } from '../../../interfaces/category.interface';
import { IBrand } from '../../../interfaces/brand.interface';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { TextareaModule } from 'primeng/textarea';
import { ProductsService } from '../../../services/products.service';
import { IProduct } from '../../../interfaces/product.interface';
import { IPackage } from '../../../interfaces/package.interface';
import { PackageService } from '../../../services/package.service';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { environment } from '../../../../environments/environment';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { inject } from '@angular/core';

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
    UploadFilesComponent,
    GradientBuilderComponent,
    TextareaModule,
    MultiLanguagePipe,
    TranslateModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './banner-list.component.html',
  styleUrls: ['./banner-list.component.scss']
})
export class BannerListComponent extends ComponentBase implements OnInit {
  banners = signal<Banner[]>([]);
  products = signal<IProduct[]>([]);
  packages = signal<IPackage[]>([]);
  bannerDialog:boolean=false;
  deleteBannerDialog = signal(false);
  banner = signal<Banner | null>(null);
  submitted = signal(false);
  loading = signal(false);
  categories = signal<ICategory[]>([]);
  brands = signal<IBrand[]>([]);
  bannerForm!: FormGroup;

  // Cache extracted gradient values to avoid performance issues
  extractedColors: string[] = ['#ff512f', '#dd2476'];
  extractedDirection: string = 'to right';

  translate = inject(TranslateService);

  // Language support
  currentLanguage = signal<SupportedLanguage>('en');
  languages = signal<{label: string, value: SupportedLanguage}[]>([]);

  // Alignment options
  alignItemsOptions: { label: string, value: string }[] = [];
  justifyContentOptions: { label: string, value: string }[] = [];
  flexDirectionOptions: { label: string, value: string }[] = [];

  constructor(
    private bannerService: BannerService,
    private messageService: MessageService,
    private productService: ProductsService, 
    private packageService: PackageService,
    private fb: FormBuilder,
    private categoryService: CategoryService,
    private brandService: BrandService
    ) {
    super();
  }

  ngOnInit() {
    this.initializeLanguages();
    this.loadBanners();
    this.initForm();
    this.loadPackages();
    this.updateAlignmentOptions();
    
    this.translate.onLangChange.subscribe(() => {
      this.initializeLanguages();
      this.updateAlignmentOptions();
    });
  }

  updateAlignmentOptions() {
    this.alignItemsOptions = [
      { label: this.translate.instant('banner.alignItemsFlexStart'), value: 'flex-start' },
      { label: this.translate.instant('banner.alignItemsCenter'), value: 'center' },
      { label: this.translate.instant('banner.alignItemsFlexEnd'), value: 'flex-end' }
    ];

    this.justifyContentOptions = [
      { label: this.translate.instant('banner.justifyContentFlexStart'), value: 'flex-start' },
      { label: this.translate.instant('banner.justifyContentCenter'), value: 'center' },
      { label: this.translate.instant('banner.justifyContentFlexEnd'), value: 'flex-end' },
      { label: this.translate.instant('banner.justifyContentSpaceBetween'), value: 'space-between' },
      { label: this.translate.instant('banner.justifyContentSpaceAround'), value: 'space-around' }
    ];

    this.flexDirectionOptions = [
      { label: this.translate.instant('banner.flexDirectionRow'), value: 'row' },
      { label: this.translate.instant('banner.flexDirectionRowReverse'), value: 'row-reverse' }
    ];
  }

  initializeLanguages() {
    this.languages.set([
      { label: this.translate.instant('common.english'), value: 'en' },
      { label: this.translate.instant('common.arabic'), value: 'ar' }
    ]);
  }
    getImageUrl(filePath: string): string {
        return `${environment.baseUrl}/${filePath}`;
    }

  initForm() {
    this.bannerForm = this.fb.group({
      tag: this.fb.group({
        en: ['', [Validators.required]],
        ar: ['', [Validators.required]]
      }),
      title: this.fb.group({
        en: ['', [Validators.required]],
        ar: ['', [Validators.required]]
      }),
      description: this.fb.group({
        en: ['', [Validators.required]],
        ar: ['', [Validators.required]]
      }),
      image: [null, [Validators.required]],
      isActive: [true],
      startDate: [null],
      endDate: [null],
      background: [''],
      alignItems: ['center'],
      justifyContent: ['center'],
      flexDirection: ['row'],
      noBackground: [false],
      textColor: ['#ffffff'],
      buttons: this.fb.array([])
    });
  }

  get buttonsArray(): FormArray {
    return this.bannerForm.get('buttons') as FormArray;
  }

  addButton() {
    const buttonGroup = this.fb.group({
      label: this.fb.group({
        en: ['', [Validators.required]],
        ar: ['', [Validators.required]]
      }),
      url: ['', [Validators.required]]
    });
    this.buttonsArray.push(buttonGroup);
  }

  removeButton(index: number) {
    this.buttonsArray.removeAt(index);
  }

  loadProducts() {
    this.productService.getProductsList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: BaseResponse<IProduct[]>) => {
        this.products.set(response.data);
      },
      error: (error) => {
      }
    });
  }

  loadBanners() {
    this.loading.set(true);
    this.bannerService.getAllBanners().subscribe({
      next: (banners) => {
        this.banners.set(banners.data);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('banner.failedToLoad')
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

    // Reset cached gradient values
    this.extractedColors = ['#ff512f', '#dd2476'];
    this.extractedDirection = 'to right';

    // Explicitly reset noBackground
    this.bannerForm.get('noBackground')?.setValue(false);
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
        label: this.fb.group({
          en: [button.label.en, [Validators.required]],
          ar: [button.label.ar, [Validators.required]]
        }),
        url: [button.url, [Validators.required]]
      });
      this.buttonsArray.push(buttonGroup);
    });

    this.bannerForm.patchValue({
      tag: {
        en: banner.tag.en,
        ar: banner.tag.ar
      },
      title: {
        en: banner.title.en,
        ar: banner.title.ar
      },
      description: {
        en: banner.description.en,
        ar: banner.description.ar
      },
      image: banner.image,
      isActive: banner.isActive,
      startDate: banner.startDate ? new Date(banner.startDate) : null,
      endDate: banner.endDate ? new Date(banner.endDate) : null,
      background: banner.background || '',
      alignItems: banner.alignItems || 'center',
      justifyContent: banner.justifyContent || 'center',
      flexDirection: banner.flexDirection || 'row',
      noBackground: banner.noBackground || false,
      textColor: banner.textColor || '#ffffff'
    });

    // Cache extracted gradient values to avoid performance issues
    this.extractedColors = this.extractGradientColors(banner.background || '');
    this.extractedDirection = this.extractGradientDirection(banner.background || '');

    // If background is empty but we have extracted colors, generate the gradient
    if (!banner.background && this.extractedColors.length > 0) {
      const colorString = this.extractedColors.join(', ');
      const generatedGradient = `linear-gradient(${this.extractedDirection}, ${colorString})`;
      this.bannerForm.get('background')?.setValue(generatedGradient);
    }
  }

  deleteBanner(banner: Banner) {
    this.deleteBannerDialog.set(true);
    this.banner.set(banner);
  }

  confirmDelete() {
    if (this.banner()) {
      this.bannerService.deleteBanner(this.banner()?._id!).subscribe({
        next: () => {
          this.deleteBannerDialog.set(false);
          this.banner.set(null);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('banner.deletedSuccessfully'),
            life: 3000
          });
          this.loadBanners();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('banner.failedToDelete')
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
        buttons: this.buttonsArray.value
      };

      if (this.banner()?._id) {
        // Update existing banner
        this.bannerService.updateBanner(this.banner()!._id!, bannerData).subscribe({
          next: (updatedBanner) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('common.success'),
              detail: this.translate.instant('banner.updatedSuccessfully'),
              life: 3000
            });
            this.hideDialog();
            this.loadBanners();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('common.error'),
              detail: this.translate.instant('banner.failedToUpdate')
            });
          }
        });
      } else {
        // Create new banner
        this.bannerService.createBanner(bannerData).subscribe({
          next: (newBanner) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('common.success'),
              detail: this.translate.instant('banner.createdSuccessfully'),
              life: 3000
            });
            this.hideDialog();
            this.loadBanners();
          },
          error: (error) => {
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('common.error'),
              detail: this.translate.instant('banner.failedToCreate')
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
          summary: this.translate.instant('common.success'),
          detail: updatedBanner.data.isActive 
            ? this.translate.instant('banner.activated') 
            : this.translate.instant('banner.deactivated'),
          life: 3000
        });
        this.loadBanners();
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('banner.failedToToggle')
        });
      }
    });
  }

  getSeverity(isActive: boolean): string {
    return isActive ? 'success' : 'danger';
  }

  getStatusLabel(isActive: boolean): string {
    return isActive 
      ? this.translate.instant('common.active') 
      : this.translate.instant('common.inactive');
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
    this.packageService.getPackagesList().pipe(takeUntil(this.destroy$)).subscribe({
      next: (response: BaseResponse<IPackage[]>) => {
        this.packages.set(response.data); 
      },
      error: (error) => {
      }
    });
  }


  // Language helper methods
  onLanguageChange(event: any) {
    this.currentLanguage.set(event.value);
  }

  // Helper to get current language display text
  getLanguageLabel(lang: SupportedLanguage): string {
    const language = this.languages().find(l => l.value === lang);
    return language ? language.label : lang;
  }

  onGradientChange(gradient: string) {
    this.bannerForm.get('background')?.setValue(gradient);

    // Update cached values to avoid re-extraction on every change detection
    this.extractedColors = this.extractGradientColors(gradient);
    this.extractedDirection = this.extractGradientDirection(gradient);
  }

  onNoBackgroundChange(noBackground: boolean) {
    this.bannerForm.get('noBackground')?.setValue(noBackground);
  }

  // Helper methods for gradient builder
  extractGradientColors(gradientString: string): string[] {
    if (!gradientString || !gradientString.includes('linear-gradient')) {
      return ['#ff512f', '#dd2476'];
    }

    try {
      // Extract colors from linear-gradient string
      const colorsMatch = gradientString.match(/linear-gradient\([^,]+,\s*(.+)\)/);
      if (colorsMatch) {
        const colors = colorsMatch[1].split(',').map(color => color.trim());
        return colors.filter(color => color && !color.includes('deg') && !color.startsWith('to '));
      }
    } catch (error) {
      console.warn('Error parsing gradient colors:', error);
    }

    return ['#ff512f', '#dd2476'];
  }

  extractGradientDirection(gradientString: string): string {
    if (!gradientString || !gradientString.includes('linear-gradient')) {
      return 'to right';
    }

    try {
      // Extract direction from linear-gradient string
      const directionMatch = gradientString.match(/linear-gradient\(([^,]+),\s*.+\)/);
      if (directionMatch) {
        const direction = directionMatch[1].trim();
        return direction;
      }
    } catch (error) {
      console.warn('Error parsing gradient direction:', error);
    }

    return 'to right';
  }
} 