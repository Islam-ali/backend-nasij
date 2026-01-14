import { ChangeDetectorRef, Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';

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
import { InputNumberModule } from 'primeng/inputnumber';

// Services
import { FeatureService } from '../../../services/feature.service';

// Interfaces
import { Feature } from '../../../interfaces/feature.interface';

// Components
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { BaseResponse } from '../../../core/models/baseResponse';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { TextareaModule } from 'primeng/textarea';
import { environment } from '../../../../environments/environment';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { inject } from '@angular/core';

@Component({
  selector: 'app-feature-list',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ButtonModule,
    CardModule,
    DialogModule,
    InputTextModule,
    TextareaModule,
    TableModule,
    ToastModule,
    ConfirmDialogModule,
    ToggleButtonModule,
    InputNumberModule,
    UploadFilesComponent,
    TranslateModule
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './feature-list.component.html',
  styleUrls: ['./feature-list.component.scss']
})
export class FeatureListComponent extends ComponentBase implements OnInit {
  features = signal<Feature[]>([]);
  featureDialog: boolean = false;
  deleteFeatureDialog: boolean = false;
  feature = signal<Feature | null>(null);
  submitted = signal(false);
  loading = signal(false);
  featureForm!: FormGroup;
  translate = inject(TranslateService);

  constructor(
    private featureService: FeatureService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private fb: FormBuilder,
    private cd: ChangeDetectorRef
  ) {
    super();
  }

  ngOnInit() {
    this.loadFeatures();
    this.initForm();
  }

  getImageUrl(filePath: string): string {
    return `${environment.baseUrl}/${filePath}`;
}

  initForm() {
    this.featureForm = this.fb.group({
      title: this.fb.group({
        en: ['', [Validators.required]],
        ar: ['', [Validators.required]]
      }),
      description: this.fb.group({
        en: ['', [Validators.required]],
        ar: ['', [Validators.required]]
      }),
      icon: [null, [Validators.required]],
      isActive: [true],
      sortOrder: [0]
    });
  }

  loadFeatures() {
    this.loading.set(true);
    this.featureService.getAllFeatures().subscribe({
      next: (response) => {
        this.features.set(response.data);
        this.loading.set(false);
      },
      error: (error) => {
        console.error('Error loading features:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('feature.failedToLoad')
        });
        this.loading.set(false);
      }
    });
  }

  openNew() {
    this.feature.set(null);
    this.submitted.set(false);
    this.featureDialog = true;
    this.featureForm.reset();
    this.featureForm.patchValue({
      isActive: true,
      sortOrder: 0,
      icon: null
    });
  }

  editFeature(feature: Feature) {
    this.feature.set({ ...feature });
    this.featureDialog = true;
    this.submitted.set(false);

    this.featureForm.patchValue({
      title: feature.title,
      description: feature.description,
      icon: feature.icon,
      isActive: feature.isActive,
      sortOrder: feature.sortOrder
    });
  }

  deleteFeature(feature: Feature) {
    this.deleteFeatureDialog = true;
    this.feature.set(feature);
  }

  confirmDelete() {
    if (this.feature()) {
      this.featureService.deleteFeature(this.feature()!._id!).subscribe({
        next: () => {
          this.deleteFeatureDialog = false;
          this.feature.set(null);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('common.success'),
            detail: this.translate.instant('feature.deletedSuccessfully'),
            life: 3000
          });
          this.loadFeatures();
        },
        error: (error) => {
          console.error('Error deleting feature:', error);
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('common.error'),
            detail: this.translate.instant('feature.failedToDelete')
          });
        }
      });
    }
  }

  hideDialog() {
    this.featureDialog = false;
    this.submitted.set(false);
  }

  saveFeature() {
    this.submitted.set(true);

    if (this.featureForm.valid) {
      const featureData = this.featureForm.value;

      if (this.feature()?._id) {
        // Update existing feature
        this.featureService.updateFeature(this.feature()!._id!, featureData).subscribe({
          next: (updatedFeature) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('common.success'),
              detail: this.translate.instant('feature.updatedSuccessfully'),
              life: 3000
            });
            this.hideDialog();
            this.loadFeatures();
          },
          error: (error) => {
            console.error('Error updating feature:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('common.error'),
              detail: this.translate.instant('feature.failedToUpdate')
            });
          }
        });
      } else {
        // Create new feature
        this.featureService.createFeature(featureData).subscribe({
          next: (newFeature) => {
            this.messageService.add({
              severity: 'success',
              summary: this.translate.instant('common.success'),
              detail: this.translate.instant('feature.createdSuccessfully'),
              life: 3000
            });
            this.hideDialog();
            this.loadFeatures();
          },
          error: (error) => {
            console.error('Error creating feature:', error);
            this.messageService.add({
              severity: 'error',
              summary: this.translate.instant('common.error'),
              detail: this.translate.instant('feature.failedToCreate')
            });
          }
        });
      }
    }
  }

  toggleActive(feature: Feature) {
    this.featureService.toggleFeatureActive(feature._id!).subscribe({
      next: (updatedFeature) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.success'),
          detail: updatedFeature.data.isActive 
            ? this.translate.instant('feature.activated') 
            : this.translate.instant('feature.deactivated'),
          life: 3000
        });
        this.loadFeatures();
      },
      error: (error) => {
        console.error('Error toggling feature:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('feature.failedToToggle')
        });
      }
    });
  }

  updateSortOrder(feature: Feature, event: any) {
    const newSortOrder = event.value;
    this.featureService.updateFeatureSortOrder(feature._id!, newSortOrder).subscribe({
      next: (updatedFeature) => {
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant('common.success'),
          detail: this.translate.instant('feature.sortOrderUpdated'),
          life: 3000
        });
        this.loadFeatures();
      },
      error: (error) => {
        console.error('Error updating sort order:', error);
        this.messageService.add({
          severity: 'error',
          summary: this.translate.instant('common.error'),
          detail: this.translate.instant('feature.failedToUpdateSortOrder')
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
} 