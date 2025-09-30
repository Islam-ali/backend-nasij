import { Component, Input, Output, EventEmitter, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { 
  Timeline, 
  CreateTimelineRequest, 
  UpdateTimelineRequest,
  AddTimelineToOrderRequest 
} from '../../../interfaces/timeline.interface';
import { TimelineService } from '../../../services/timeline.service';
import { CommonService } from '../../../core/services/common.service';

@Component({
  selector: 'app-timeline-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './timeline-form.component.html',
  styleUrls: ['./timeline-form.component.scss']
})
export class TimelineFormComponent implements OnInit, OnDestroy, OnChanges {
  @Input() orderId?: string; // If provided, this is for adding timeline to order
  @Input() editTimeline?: Timeline; // If provided, this is for editing existing timeline
  @Input() availableTimelines: Timeline[] = []; // Available timelines for order assignment
  @Input() isDialogMode = false; // If true, hide the form header (for dialog usage)
  
  @Output() timelineCreated = new EventEmitter<Timeline>();
  @Output() timelineUpdated = new EventEmitter<Timeline>();
  @Output() timelineAddedToOrder = new EventEmitter<any>();
  @Output() formCancelled = new EventEmitter<void>();

  timelineForm: FormGroup;
  loading = false;
  error: string | null = null;
  isEditMode = false;
  isOrderMode = false;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private fb: FormBuilder,
    private timelineService: TimelineService,
    private commonService: CommonService
  ) {
    this.timelineForm = this.createForm();
  }

  ngOnInit(): void {
    this.isEditMode = !!this.editTimeline;
    this.isOrderMode = !!this.orderId && !this.editTimeline;
    
    if (this.isEditMode && this.editTimeline) {
      this.populateFormForEdit();
    } else if (this.isOrderMode) {
      this.setupFormForOrder();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle changes to editTimeline input
    if (changes['editTimeline'] && !changes['editTimeline'].firstChange) {
      this.isEditMode = !!this.editTimeline;
      this.isOrderMode = !!this.orderId && !this.editTimeline;
      
      if (this.isEditMode && this.editTimeline) {
        this.populateFormForEdit();
      } else if (this.isOrderMode) {
        this.setupFormForOrder();
      } else {
        // Reset form for create mode
        this.resetForm();
      }
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createForm(): FormGroup {
    return this.fb.group({
      // For creating new timeline
      nameEn: ['', Validators.required],
      nameAr: ['', Validators.required],
      dateTime: ['', Validators.required],
      icon: ['', Validators.required],
      
      // For adding timeline to order
      timelineId: [''],
      note: ['']
    });
  }

  private populateFormForEdit(): void {
    if (this.editTimeline) {
      // Reset form first to clear any previous state
      this.timelineForm.reset();
      
      // Set validators for edit mode
      this.timelineForm.get('nameEn')?.setValidators([Validators.required]);
      this.timelineForm.get('nameAr')?.setValidators([Validators.required]);
      this.timelineForm.get('icon')?.setValidators([Validators.required]);
      this.timelineForm.get('dateTime')?.setValidators([Validators.required]);
      
      // Clear validators for order mode fields
      this.timelineForm.get('timelineId')?.clearValidators();
      this.timelineForm.get('note')?.clearValidators();
      
      // Update validation
      this.timelineForm.get('nameEn')?.updateValueAndValidity();
      this.timelineForm.get('nameAr')?.updateValueAndValidity();
      this.timelineForm.get('icon')?.updateValueAndValidity();
      this.timelineForm.get('dateTime')?.updateValueAndValidity();
      this.timelineForm.get('timelineId')?.updateValueAndValidity();
      this.timelineForm.get('note')?.updateValueAndValidity();
      
      // Patch form values
      this.timelineForm.patchValue({
        nameEn: this.editTimeline.name.en,
        nameAr: this.editTimeline.name.ar,
        dateTime: new Date(this.editTimeline.dateTime).toISOString().slice(0, 16),
        icon: this.editTimeline.icon
      });
      
      // Mark form as pristine since we just loaded data
      this.timelineForm.markAsPristine();
    }
  }

  private setupFormForOrder(): void {
    // For order mode, we only need timelineId, note, and dateTime
    this.timelineForm.get('nameEn')?.clearValidators();
    this.timelineForm.get('nameAr')?.clearValidators();
    this.timelineForm.get('icon')?.clearValidators();
    this.timelineForm.get('timelineId')?.setValidators([Validators.required]);
    this.timelineForm.get('dateTime')?.setValidators([Validators.required]);
    
    // Set default date to now
    this.timelineForm.patchValue({
      dateTime: new Date().toISOString().slice(0, 16)
    });
  }

  onSubmit(): void {
    if (this.timelineForm.valid) {
      this.loading = true;
      this.error = null;

      if (this.isEditMode) {
        this.updateTimeline();
      } else if (this.isOrderMode) {
        this.addTimelineToOrder();
      } else {
        this.createTimeline();
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createTimeline(): void {
    const formValue = this.timelineForm.value;
    const timelineData: CreateTimelineRequest = {
      name: {
        en: formValue.nameEn,
        ar: formValue.nameAr
      },
      dateTime: new Date(formValue.dateTime),
      icon: formValue.icon
    };

    this.timelineService.createTimeline(timelineData)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.timelineCreated.emit(response.data);
          this.resetForm();
          this.loading = false;
        },
        error: (error) => {
            this.error = error?.message || 'Failed to add timeline to order';
          this.loading = false;
        }
      });
  }

  private updateTimeline(): void {
    const formValue = this.timelineForm.value;
    const timelineData: UpdateTimelineRequest = {
      name: {
        en: formValue.nameEn,
        ar: formValue.nameAr
      },
      dateTime: new Date(formValue.dateTime),
      icon: formValue.icon
    };

    if (this.editTimeline?._id) {
      this.timelineService.updateTimeline(this.editTimeline._id, timelineData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.timelineUpdated.emit(response.data);
            this.resetForm();
            this.loading = false;
          },
          error: (error) => {
            this.error = error?.message || 'Failed to update timeline';
            this.loading = false;
          }
        });
    }
  }

  private addTimelineToOrder(): void {
    const formValue = this.timelineForm.value;
    const timelineData: AddTimelineToOrderRequest = {
      timelineId: formValue.timelineId,
      note: formValue.note,
      dateTime: new Date(formValue.dateTime)
    };

    if (this.orderId) {
      this.timelineService.addTimelineToOrder(this.orderId, timelineData)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (response) => {
            this.timelineAddedToOrder.emit(response.data);
            this.resetForm();
            this.loading = false;
          },
          error: (error) => {
            this.error = error?.message || 'Failed to add timeline to order';
            this.loading = false;
          }
        });
    }
  }

  private resetForm(): void {
    this.timelineForm.reset();
    if (this.isOrderMode) {
      this.timelineForm.patchValue({
        dateTime: new Date().toISOString().slice(0, 16)
      });
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.timelineForm.controls).forEach(key => {
      const control = this.timelineForm.get(key);
      control?.markAsTouched();
    });
  }

  onCancel(): void {
    this.formCancelled.emit();
  }

  getFieldError(fieldName: string): string {
    const field = this.timelineForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return `${this.getFieldLabel(fieldName)} is required`;
      }
    }
    return '';
  }

  private getFieldLabel(fieldName: string): string {
    const labels: { [key: string]: string } = {
      nameEn: 'English Name',
      nameAr: 'Arabic Name',
      dateTime: 'Date & Time',
      icon: 'Icon',
      timelineId: 'Timeline',
      note: 'Note'
    };
    return labels[fieldName] || fieldName;
  }
}