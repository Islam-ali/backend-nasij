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
import { CalendarModule } from 'primeng/calendar';

import { IReview } from '../../../interfaces/review.interface';
import { ReviewService } from '../../../services/review.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { inject } from '@angular/core';

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
        TooltipModule,
        CalendarModule,
        TranslateModule
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
    translate = inject(TranslateService);

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
        this.updateColumns();
        this.translate.onLangChange.subscribe(() => {
            this.updateColumns();
        });
    }

    updateColumns() {
        this.cols = [
            { field: 'customerName', header: this.translate.instant('review.customerName') },
            { field: 'rating', header: this.translate.instant('review.rating') },
            { field: 'comment', header: this.translate.instant('review.comment') },
            { field: 'reviewDate', header: this.translate.instant('review.reviewDate') },
            { field: 'images', header: this.translate.instant('review.images') },
            { field: 'video', header: this.translate.instant('review.video') },
            { field: 'isActive', header: this.translate.instant('review.active') },
            { field: 'isPinned', header: this.translate.instant('review.pinned') },
            { field: 'actions', header: this.translate.instant('common.actions') }
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
            order: [0],
            reviewDate: [null]
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
                // Convert reviewDate strings to Date objects
                const reviewsWithDates = res.data.map(review => ({
                    ...review,
                    reviewDate: review.reviewDate ? new Date(review.reviewDate) : undefined,
                    createdAt: review.createdAt ? new Date(review.createdAt) : undefined,
                    updatedAt: review.updatedAt ? new Date(review.updatedAt) : undefined
                }));
                this.reviews.set(reviewsWithDates);
            },
            error: () => this.messageService.add({
                severity: 'error', 
                summary: this.translate.instant('common.error'), 
                detail: this.translate.instant('review.failedToLoad'), 
                life: 1000
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
            order: 0,
            reviewDate: undefined
        });
        this.reviewDialog = true;
    }

    editReview(review: IReview) {
        this.reviewForm.patchValue({
            ...review,
            reviewDate: review.reviewDate ? new Date(review.reviewDate) : undefined
        });
        this.reviewDialog = true;
    }

    deleteReview(review: IReview) {
        this.confirmationService.confirm({
            message: this.translate.instant('review.confirmDelete', { customerName: review.customerName }),
            header: this.translate.instant('common.confirm'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.reviewService.deleteReview(review._id!).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.loadReviews();
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: this.translate.instant('common.deleted'), 
                            detail: this.translate.instant('review.deletedSuccessfully') 
                        });
                    },
                    error: () => this.messageService.add({ 
                        severity: 'error', 
                        summary: this.translate.instant('common.error'), 
                        detail: this.translate.instant('review.failedToDelete') 
                    })
                });
            }
        });
    }

    saveReview() {
        this.submitted = true;

        if (this.reviewForm.invalid) {
            this.messageService.add({
                severity: 'error', 
                summary: this.translate.instant('common.error'), 
                detail: this.translate.instant('review.fixFormErrors'), 
                life: 1000
            });
            return;
        }

        const formValue = {
            ...this.reviewForm.value,
            reviewDate: this.reviewForm.value.reviewDate ? this.reviewForm.value.reviewDate.toISOString() : undefined
        };

        const request$ = formValue._id
            ? this.reviewService.updateReview(formValue._id, formValue)
            : this.reviewService.createReview(formValue);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: BaseResponse<any>) => {
                this.loadReviews();
                this.messageService.add({
                    severity: 'success',
                    summary: formValue._id 
                        ? this.translate.instant('common.updated') 
                        : this.translate.instant('common.created'),
                    detail: formValue._id 
                        ? this.translate.instant('review.updatedSuccessfully')
                        : this.translate.instant('review.createdSuccessfully')
                });
                this.hideDialog();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error', 
                    summary: this.translate.instant('common.error'), 
                    detail: this.translate.instant('review.failedToSave'), 
                    life: 1000
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

