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
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { CalendarModule } from 'primeng/calendar';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { TooltipModule } from 'primeng/tooltip';

import { IHero } from '../../../interfaces/hero.interface';
import { HeroService } from '../../../services/hero.service';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { environment } from '../../../../environments/environment';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-hero-list',
    templateUrl: './hero-list.component.html',
    styleUrls: ['./hero-list.component.scss'],
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
        FallbackImgDirective,
        FormsModule,
        TextareaModule,
        UploadFilesComponent,
        CalendarModule,
        ToggleSwitchModule,
        PaginatorModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService, HeroService]
})
export class HeroListComponent extends ComponentBase implements OnInit {
    heroForm!: FormGroup;
    heroDialog = false;
    submitted = false;
    selectedHeroes!: IHero[] | null;
    loading = signal<boolean>(false);
    heroes = signal<IHero[]>([]);
    pagination = signal<pagination>({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });

    statusOptions = [
        { label: 'Active', value: true },
        { label: 'Inactive', value: false }
    ];

    alwaysOptions = [
        { label: 'Always Active', value: true },
        { label: 'Scheduled', value: false }
    ];

    @ViewChild('dt') dt: Table | undefined;
    cols!: Column[];

    constructor(
        private fb: FormBuilder,
        private heroService: HeroService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        super();
    }

    get formControlImage(): FormControl {
        return this.heroForm?.get('image') as FormControl;
    }

    ngOnInit() {
        this.buildForm();
        this.loadHeroes();
        this.cols = [
            { field: 'title', header: 'Title' },
            { field: 'subTitle', header: 'Subtitle' },
            { field: 'image', header: 'Image' },
            { field: 'isAlways', header: 'Type' },
            { field: 'isActive', header: 'Status' },
            { field: 'actions', header: 'Actions' }
        ];
    }

    buildForm() {
        this.heroForm = this.fb.group({
            _id: [null],
            title: this.fb.group({
                en: ['', Validators.required],
                ar: ['', Validators.required]
            }),
            subTitle: this.fb.group({
                en: [''],
                ar: ['']
            }),
            buttonName: this.fb.group({
                en: [''],
                ar: ['']
            }),
            buttonLink: [''],
            image: [null],
            startDate: [null],
            endDate: [null],
            isAlways: [false, Validators.required],
            isActive: [true],
            order: [0]
        });

        // Add conditional validation for dates
        this.heroForm.get('isAlways')?.valueChanges.subscribe(isAlways => {
            const startDateControl = this.heroForm.get('startDate');
            const endDateControl = this.heroForm.get('endDate');

            if (isAlways) {
                startDateControl?.clearValidators();
                endDateControl?.clearValidators();
            } else {
                startDateControl?.setValidators([Validators.required]);
                endDateControl?.setValidators([Validators.required]);
            }

            startDateControl?.updateValueAndValidity();
            endDateControl?.updateValueAndValidity();
        });
    }

    getImageUrl(filePath: string): string {
        return `${environment.baseUrl}/${filePath}`;
    }

    getSeverity(status: boolean) {
        return status ? 'success' : 'danger';
    }

    getAlwaysSeverity(isAlways: boolean) {
        return isAlways ? 'info' : 'warning';
    }

    onGlobalFilter(dt: Table, event: any): void {
        dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    loadHeroes(page: number = 0, limit: number = 10) {
        this.loading.set(true);
        this.heroService.getHeroes({
            limit: limit,
            page: page + 1,
            isAll: true
        }).pipe(
            takeUntil(this.destroy$),
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (res: any) => {
                this.heroes.set(res.data.heroes);
                this.pagination.set(res.data.pagination);
            },
            error: () => this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Failed to load heroes', life: 1000
            })
        });
    }

    openNew() {
        this.heroForm.reset();
        this.heroForm.patchValue({
            isAlways: false,
            isActive: true,
            image: null
        });
        this.heroDialog = true;
    }

    editHero(hero: IHero) {
        this.heroForm.patchValue({
            ...hero,
        });
        this.heroDialog = true;
    }

    deleteHero(hero: IHero) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${hero.title}"?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.heroService.deleteHero(hero._id!).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.loadHeroes();
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Hero deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }

    saveHero() {
        this.submitted = true;

        if (this.heroForm.invalid) {
            this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Please fix form errors', life: 1000
            });
            return;
        }

        const formValue = this.heroForm.value;

        const request$ = formValue._id
            ? this.heroService.updateHero(formValue._id, formValue)
            : this.heroService.createHero(formValue);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: BaseResponse<any>) => {
                this.loadHeroes();
                this.messageService.add({
                    severity: 'success',
                    summary: formValue._id ? 'Updated' : 'Created',
                    detail: `Hero ${formValue._id ? 'updated' : 'created'} successfully`
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
        this.heroDialog = false;
        this.submitted = false;
        this.heroForm.reset();
    }

    onPageChange(event: any) {
        this.loadHeroes(event.page, event.rows);
    }
} 