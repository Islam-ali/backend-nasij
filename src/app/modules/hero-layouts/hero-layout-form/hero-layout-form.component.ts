import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { inject } from '@angular/core';

// PrimeNG
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { ChipsModule } from 'primeng/chips';
import { InputSwitchModule } from 'primeng/inputswitch';

// Services
import { MessageService } from 'primeng/api';
import { HeroLayoutsService } from '../../../services/hero-layouts.service';
import { IHeroLayout } from '../../../interfaces/hero-layout.interface';

// Components
import { HeroGridBuilderComponent } from '../../featured-collections/hero-grid-builder/hero-grid-builder.component';
import { IProfessionalGridConfig } from '../../../interfaces/professional-grid.interface';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { TextareaModule } from 'primeng/textarea';
import { DropdownModule } from 'primeng/dropdown';

@Component({
  selector: 'app-hero-layout-form',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ButtonModule,
    ToastModule,
    InputTextModule,
    CardModule,
    TabViewModule,
    ChipsModule,
    InputSwitchModule,
    TextareaModule,
    HeroGridBuilderComponent,
    UploadFilesComponent,
    TranslateModule,
    DropdownModule
    
  ],
  templateUrl: './hero-layout-form.component.html',
  styleUrls: ['./hero-layout-form.component.scss'],
  providers: [MessageService]
})
export class HeroLayoutFormComponent implements OnInit {
  loading = signal<boolean>(false);
  submitted = false;
  heroLayoutForm!: FormGroup;
  heroLayoutId: string | null = null;
  isEditMode = false;
  translate = inject(TranslateService);

  // Layout options
  maxWidthOptions: { label: string, value: string }[] = [];
  justifyOptions: { label: string, value: string }[] = [];
  alignOptions: { label: string, value: string }[] = [];

  constructor(
    private fb: FormBuilder,
    private heroLayoutsService: HeroLayoutsService,
    private messageService: MessageService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeOptions();
    this.initForm();

    // Check if we're in edit mode
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id && id !== 'new') {
        this.heroLayoutId = id;
        this.isEditMode = true;
        this.loadHeroLayout(id);
      }
    });
  }

  initializeOptions(): void {
    this.maxWidthOptions = [
      { label: this.translate.instant('heroLayout.none'), value: 'none' },
      { label: '1200px', value: '1200px' },
      { label: '1440px', value: '1440px' },
      { label: '1600px', value: '1600px' },
      { label: '1920px', value: '1920px' }
    ];

    this.justifyOptions = [
      { label: this.translate.instant('heroLayout.justifyStart'), value: 'start' },
      { label: this.translate.instant('heroLayout.justifyCenter'), value: 'center' },
      { label: this.translate.instant('heroLayout.justifyEnd'), value: 'end' },
      { label: this.translate.instant('heroLayout.justifyBetween'), value: 'between' },
      { label: this.translate.instant('heroLayout.justifyAround'), value: 'around' },
      { label: this.translate.instant('heroLayout.justifyEvenly'), value: 'evenly' }
    ];

    this.alignOptions = [
      { label: this.translate.instant('heroLayout.alignStart'), value: 'start' },
      { label: this.translate.instant('heroLayout.alignCenter'), value: 'center' },
      { label: this.translate.instant('heroLayout.alignEnd'), value: 'end' },
      { label: this.translate.instant('heroLayout.alignStretch'), value: 'stretch' }
    ];
  }

  initForm(): void {
    this.heroLayoutForm = this.fb.group({
      name: [''],
      sectionTitle: this.fb.group({
        en: [''],
        ar: ['']
      }),
      sectionSubtitle: this.fb.group({
        en: [''],
        ar: ['']
      }),
      description: this.fb.group({
        en: [''],
        ar: ['']
      }),
      items: this.fb.array([]),
      gridConfig: [null],
      layout: this.fb.group({
        maxWidth: ['1440px'],
        justifyContent: ['center'],
        alignItems: ['center']
      }),
      isActive: [true],
      displayOrder: [0],
      tags: [[]]
    });
  }

  get itemsArray(): FormArray {
    return this.heroLayoutForm.get('items') as FormArray;
  }

  loadHeroLayout(id: string): void {
    this.loading.set(true);
    this.heroLayoutsService.getHeroLayoutById(id).subscribe({
      next: (response) => {
        const heroLayout = response.data;
        if (heroLayout) {
          // Patch basic fields (without emitting events to prevent unwanted changes)
          this.heroLayoutForm.patchValue({
            name: heroLayout.name || '',
            isActive: heroLayout.isActive !== undefined ? heroLayout.isActive : true,
            displayOrder: heroLayout.displayOrder || 0,
            tags: heroLayout.tags || [],
            gridConfig: heroLayout.gridConfig || null
          }, { emitEvent: false });

          // Patch layout settings from gridConfig if available
          const layoutGroup = this.heroLayoutForm.get('layout') as FormGroup;
          if (layoutGroup && heroLayout.gridConfig) {
            layoutGroup.patchValue({
              maxWidth: heroLayout.gridConfig.maxWidth || '1440px',
              justifyContent: heroLayout.gridConfig.justifyContent || 'center',
              alignItems: heroLayout.gridConfig.alignItems || 'center'
            }, { emitEvent: false });
          }

          // Patch nested FormGroups separately - always patch even if empty
          const sectionTitleGroup = this.heroLayoutForm.get('sectionTitle') as FormGroup;
          if (sectionTitleGroup) {
            sectionTitleGroup.patchValue({
              en: heroLayout.sectionTitle?.en || '',
              ar: heroLayout.sectionTitle?.ar || ''
            }, { emitEvent: false });
          }

          const sectionSubtitleGroup = this.heroLayoutForm.get('sectionSubtitle') as FormGroup;
          if (sectionSubtitleGroup) {
            sectionSubtitleGroup.patchValue({
              en: heroLayout.sectionSubtitle?.en || '',
              ar: heroLayout.sectionSubtitle?.ar || ''
            }, { emitEvent: false });
          }

          const descriptionGroup = this.heroLayoutForm.get('description') as FormGroup;
          if (descriptionGroup) {
            descriptionGroup.patchValue({
              en: heroLayout.description?.en || '',
              ar: heroLayout.description?.ar || ''
            }, { emitEvent: false });
          }

          // Load items first (grid builder needs items count)
          this.itemsArray.clear();
          if (heroLayout.items && heroLayout.items.length > 0) {
            heroLayout.items.forEach(item => {
              this.itemsArray.push(this.createItemGroup(item));
            });
          }

          // Load gridConfig - will be handled by grid builder's ngOnChanges
          // Set it directly so ngOnChanges can pick it up
          if (heroLayout.gridConfig) {
            this.heroLayoutForm.patchValue({ 
              gridConfig: heroLayout.gridConfig 
            }, { emitEvent: false });
          }
        }
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('heroLayout.failedToLoad')
        });
        this.loading.set(false);
        this.router.navigate(['/hero-layouts']);
      }
    });
  }

  addItem(): void {
    this.itemsArray.push(this.createItemGroup());
  }

  createItemGroup(item?: any): FormGroup {
    return this.fb.group({
      title: this.fb.group({
        en: [item?.title?.en || ''],
        ar: [item?.title?.ar || '']
      }),
      description: this.fb.group({
        en: [item?.description?.en || ''],
        ar: [item?.description?.ar || '']
      }),
      image: [item?.image || null],
      video: [item?.video || null],
      buttonText: this.fb.group({
        en: [item?.buttonText?.en || ''],
        ar: [item?.buttonText?.ar || '']
      }),
      buttonLink: [item?.buttonLink || ''],
      queryParams: [item?.queryParams || null],
      isActive: [item?.isActive !== undefined ? item.isActive : true],
      videoAutoplay: [item?.videoAutoplay !== undefined ? item.videoAutoplay : true]
    });
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onGridConfigChange(config: IProfessionalGridConfig): void {
    // Only update if config actually changed (prevent circular updates)
    const currentConfig = this.heroLayoutForm.get('gridConfig')?.value;
    if (JSON.stringify(currentConfig) !== JSON.stringify(config)) {
      this.heroLayoutForm.patchValue({ gridConfig: config }, { emitEvent: false });
    }
  }

  saveHeroLayout(): void {
    this.submitted = true;

    const heroLayoutData = this.cleanFormData(this.heroLayoutForm.value);

    if (this.isEditMode && this.heroLayoutId) {
      // Update
      this.loading.set(true);
      this.heroLayoutsService.updateHeroLayout(this.heroLayoutId, heroLayoutData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('heroLayout.updatedSuccessfully')
          });
          this.router.navigate(['/hero-layouts']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: error.error?.message || this.translate.instant('heroLayout.failedToUpdate')
          });
          this.loading.set(false);
        }
      });
    } else {
      // Create
      this.loading.set(true);
      this.heroLayoutsService.createHeroLayout(heroLayoutData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('heroLayout.createdSuccessfully')
          });
          this.router.navigate(['/hero-layouts']);
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: error.error?.message || this.translate.instant('heroLayout.failedToCreate')
          });
          this.loading.set(false);
        }
      });
    }
  }

  cancel(): void {
    this.router.navigate(['/hero-layouts']);
  }

  cleanFormData(data: any): any {
    // Deep clean: remove null, undefined, and empty string values
    const cleaned = { ...data };

    // Merge layout settings into gridConfig
    if (cleaned.layout) {
      if (!cleaned.gridConfig) {
        cleaned.gridConfig = {};
      }
      cleaned.gridConfig = {
        ...cleaned.gridConfig,
        maxWidth: cleaned.layout.maxWidth,
        justifyContent: cleaned.layout.justifyContent,
        alignItems: cleaned.layout.alignItems
      };
      delete cleaned.layout; // Remove layout from root level
    }

    // Clean gridConfig rows if exists
    if (cleaned.gridConfig?.rows) {
      const cleanedRows: any = {};
      Object.keys(cleaned.gridConfig.rows).forEach(key => {
        const value = cleaned.gridConfig.rows[key];
        if (value !== null && value !== undefined) {
          cleanedRows[key] = value;
        }
      });
      
      // Only keep rows if it has at least one valid value
      if (Object.keys(cleanedRows).length > 0) {
        cleaned.gridConfig.rows = cleanedRows;
      } else {
        // Remove rows entirely if all values are null/empty
        delete cleaned.gridConfig.rows;
      }
    }
    
    return cleaned;
  }
}

