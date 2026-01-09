import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';

// PrimeNG
import { TableModule } from 'primeng/table';
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
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { TabViewModule } from 'primeng/tabview';
import { ChipsModule } from 'primeng/chips';

// Services
import { MessageService, ConfirmationService } from 'primeng/api';
import { HeroLayoutsService } from '../../../services/hero-layouts.service';
import { IHeroLayout } from '../../../interfaces/hero-layout.interface';

// Components
import { HeroGridBuilderComponent } from '../../featured-collections/hero-grid-builder/hero-grid-builder.component';
import { IProfessionalGridConfig } from '../../../interfaces/professional-grid.interface';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';

@Component({
  selector: 'app-hero-layouts-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    InputTextModule,
    DialogModule,
    ConfirmDialogModule,
    TagModule,
    IconFieldModule,
    InputIconModule,
    ProgressSpinnerModule,
    CardModule,
    DividerModule,
    TabViewModule,
    ChipsModule,
    HeroGridBuilderComponent,
    UploadFilesComponent,
  ],
  templateUrl: './hero-layouts-list.component.html',
  styleUrls: ['./hero-layouts-list.component.scss'],
  providers: [MessageService, ConfirmationService]
})
export class HeroLayoutsListComponent implements OnInit {
  heroLayouts = signal<IHeroLayout[]>([]);
  loading = signal<boolean>(true);
  heroLayoutDialog = false;
  submitted = false;
  heroLayoutForm!: FormGroup;
  selectedHeroLayout: IHeroLayout | null = null;

  constructor(
    private fb: FormBuilder,
    private heroLayoutsService: HeroLayoutsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService
  ) {}

  ngOnInit(): void {
    this.loadHeroLayouts();
    this.initForm();
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
      isActive: [true],
      displayOrder: [0],
      tags: [[]]
    });
  }

  get itemsArray(): FormArray {
    return this.heroLayoutForm.get('items') as FormArray;
  }

  loadHeroLayouts(): void {
    this.loading.set(true);
    this.heroLayoutsService.getHeroLayouts().subscribe({
      next: (response) => {
        this.heroLayouts.set(response.data || []);
        this.loading.set(false);
      },
      error: (error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to load hero layouts'
        });
        this.loading.set(false);
      }
    });
  }

  openNew(): void {
    this.selectedHeroLayout = null;
    this.submitted = false;
    this.heroLayoutForm.reset({
      name: '',
      sectionTitle: { en: '', ar: '' },
      sectionSubtitle: { en: '', ar: '' },
      description: { en: '', ar: '' },
      items: [],
      gridConfig: null,
      isActive: true,
      displayOrder: 0,
      tags: []
    });
    this.itemsArray.clear();
    this.heroLayoutDialog = true;
  }

  editHeroLayout(heroLayout: IHeroLayout): void {
    this.selectedHeroLayout = heroLayout;
    this.heroLayoutForm.patchValue({
      name: heroLayout.name,
      sectionTitle: heroLayout.sectionTitle || { en: '', ar: '' },
      sectionSubtitle: heroLayout.sectionSubtitle || { en: '', ar: '' },
      description: heroLayout.description || { en: '', ar: '' },
      gridConfig: heroLayout.gridConfig,
      isActive: heroLayout.isActive,
      displayOrder: heroLayout.displayOrder || 0,
      tags: heroLayout.tags || []
    });

    // Load items
    this.itemsArray.clear();
    heroLayout.items.forEach(item => {
      this.itemsArray.push(this.createItemGroup(item));
    });

    this.heroLayoutDialog = true;
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
      buttonText: this.fb.group({
        en: [item?.buttonText?.en || ''],
        ar: [item?.buttonText?.ar || '']
      }),
      buttonLink: [item?.buttonLink || ''],
      queryParams: [item?.queryParams || null]
    });
  }

  removeItem(index: number): void {
    this.itemsArray.removeAt(index);
  }

  onGridConfigChange(config: IProfessionalGridConfig): void {
    this.heroLayoutForm.patchValue({ gridConfig: config });
  }

  saveHeroLayout(): void {
    this.submitted = true;

    const heroLayoutData = this.heroLayoutForm.value;

    if (this.selectedHeroLayout && this.selectedHeroLayout._id) {
      // Update
      this.heroLayoutsService.updateHeroLayout(this.selectedHeroLayout._id, heroLayoutData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Hero layout updated successfully'
          });
          this.loadHeroLayouts();
          this.hideDialog();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to update hero layout'
          });
        }
      });
    } else {
      // Create
      this.heroLayoutsService.createHeroLayout(heroLayoutData).subscribe({
        next: (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Hero layout created successfully'
          });
          this.loadHeroLayouts();
          this.hideDialog();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.error?.message || 'Failed to create hero layout'
          });
        }
      });
    }
  }

  deleteHeroLayout(heroLayout: IHeroLayout): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete "${heroLayout.name}"?`,
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        if (heroLayout._id) {
          this.heroLayoutsService.deleteHeroLayout(heroLayout._id).subscribe({
            next: () => {
              this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Hero layout deleted successfully'
              });
              this.loadHeroLayouts();
            },
            error: (error) => {
              this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to delete hero layout'
              });
            }
          });
        }
      }
    });
  }

  toggleActive(heroLayout: IHeroLayout): void {
    if (heroLayout._id) {
      this.heroLayoutsService.toggleActiveStatus(heroLayout._id).subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Status updated successfully'
          });
          this.loadHeroLayouts();
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update status'
          });
        }
      });
    }
  }

  hideDialog(): void {
    this.heroLayoutDialog = false;
    this.submitted = false;
  }

  onGlobalFilter(table: any, event: Event): void {
    table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
  }

}


