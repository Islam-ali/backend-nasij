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
    UploadFilesComponent
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

  initForm() {
    this.featureForm = this.fb.group({
      title: ['', [Validators.required]],
      description: ['', [Validators.required]],
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
          summary: 'Error',
          detail: 'Failed to load features'
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
            summary: 'Successful',
            detail: 'Feature Deleted',
            life: 3000
          });
          this.loadFeatures();
        },
        error: (error) => {
          console.error('Error deleting feature:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to delete feature'
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
              summary: 'Successful',
              detail: 'Feature Updated',
              life: 3000
            });
            this.hideDialog();
            this.loadFeatures();
          },
          error: (error) => {
            console.error('Error updating feature:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to update feature'
            });
          }
        });
      } else {
        // Create new feature
        this.featureService.createFeature(featureData).subscribe({
          next: (newFeature) => {
            this.messageService.add({
              severity: 'success',
              summary: 'Successful',
              detail: 'Feature Created',
              life: 3000
            });
            this.hideDialog();
            this.loadFeatures();
          },
          error: (error) => {
            console.error('Error creating feature:', error);
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to create feature'
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
          summary: 'Successful',
          detail: `Feature ${updatedFeature.data.isActive ? 'Activated' : 'Deactivated'}`,
          life: 3000
        });
        this.loadFeatures();
      },
      error: (error) => {
        console.error('Error toggling feature:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to toggle feature status'
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
          summary: 'Successful',
          detail: 'Sort order updated',
          life: 3000
        });
        this.loadFeatures();
      },
      error: (error) => {
        console.error('Error updating sort order:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Failed to update sort order'
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
} 