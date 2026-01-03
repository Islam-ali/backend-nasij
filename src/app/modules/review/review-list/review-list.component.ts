import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule, FormControl, FormArray } from '@angular/forms';

// PrimeNG Services
import { ConfirmationService, MessageService } from 'primeng/api';

// PrimeNG Modules
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { InputNumberModule } from 'primeng/inputnumber';
import { RatingModule } from 'primeng/rating';
import { TooltipModule } from 'primeng/tooltip';

import { IReview } from '../../../interfaces/review.interface';
import { ReviewService } from '../../../services/review.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-review-list',
    templateUrl: './review-list.component.html',
    styleUrls: ['./review-list.component.scss'],
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
        DropdownModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        FormsModule,
        TextareaModule,
        ToggleSwitchModule,
        InputNumberModule,
        RatingModule,
        UploadFilesComponent,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService, ReviewService]
})
export class ReviewListComponent extends ComponentBase implements OnInit {
    reviewForm!: FormGroup;
    reviewDialog = false;
    submitted = false;
    selectedReviews!: IReview[] | null;
    loading = signal<boolean>(false);
    reviews = signal<IReview[]>([]);

    ratingOptions = [
        { label: '1 Star', value: 1 },
        { label: '2 Stars', value: 2 },
        { label: '3 Stars', value: 3 },
        { label: '4 Stars', value: 4 },
        { label: '5 Stars', value: 5 }
    ];

    @ViewChild('dt') dt: Table | undefined;
    cols!: Column[];

    constructor(
        private fb: FormBuilder,
        private reviewService: ReviewService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        super();
    }

    get formControlImages(): FormControl {
        return this.reviewForm?.get('images') as FormControl;
    }

    get formControlVideo(): FormControl {
        return this.reviewForm?.get('video') as FormControl;
    }

    ngOnInit() {
        this.buildForm();
        this.loadReviews();
        this.cols = [
            { field: 'customerName', header: 'Customer Name' },
            { field: 'rating', header: 'Rating' },
            { field: 'comment', header: 'Comment' },
            { field: 'images', header: 'Images' },
            { field: 'video', header: 'Video' },
            { field: 'isActive', header: 'Active' },
            { field: 'isPinned', header: 'Pinned' },
            { field: 'actions', header: 'Actions' }
        ];
    }

    buildForm() {
        this.reviewForm = this.fb.group({
            _id: [null],
            customerName: ['', Validators.required],
            rating: [5, [Validators.required, Validators.min(1), Validators.max(5)]],
            comment: [''],
            images: [[]],
            video: [null],
            videoUrl: [''],
            isActive: [true],
            isPinned: [false],
            order: [0]
        });
    }

    getImageUrl(filePath: string): string {
        return `${environment.baseUrl}/${filePath}`;
    }

    getSeverity(status: boolean) {
        return status ? 'success' : 'danger';
    }

    getRatingSeverity(rating: number) {
        if (rating >= 4) return 'success';
        if (rating >= 3) return 'warning';
        return 'danger';
    }

    onGlobalFilter(dt: Table, event: any): void {
        dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    loadReviews() {
        this.loading.set(true);
        this.reviewService.getReviews().pipe(
            takeUntil(this.destroy$),
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (res: BaseResponse<IReview[]>) => {
                this.reviews.set(res.data);
            },
            error: () => this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Failed to load reviews', life: 1000
            })
        });
    }

    openNew() {
        this.reviewForm.reset();
        this.reviewForm.patchValue({
            rating: 5,
            isActive: true,
            isPinned: false,
            images: [],
            video: null,
            videoUrl: '',
            order: 0
        });
        this.reviewDialog = true;
    }

    editReview(review: IReview) {
        this.reviewForm.patchValue({
            ...review,
        });
        this.reviewDialog = true;
    }

    deleteReview(review: IReview) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete review from "${review.customerName}"?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.reviewService.deleteReview(review._id!).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.loadReviews();
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Review deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }

    saveReview() {
        this.submitted = true;

        if (this.reviewForm.invalid) {
            this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Please fix form errors', life: 1000
            });
            return;
        }

        const formValue = this.reviewForm.value;

        const request$ = formValue._id
            ? this.reviewService.updateReview(formValue._id, formValue)
            : this.reviewService.createReview(formValue);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: BaseResponse<any>) => {
                this.loadReviews();
                this.messageService.add({
                    severity: 'success',
                    summary: formValue._id ? 'Updated' : 'Created',
                    detail: `Review ${formValue._id ? 'updated' : 'created'} successfully`
                });
                this.hideDialog();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error', summary: 'Error', detail: 'Save failed', life: 1000
                });
            }
        });
    }

    hideDialog() {
        this.reviewDialog = false;
        this.submitted = false;
        this.reviewForm.reset();
    }
}

