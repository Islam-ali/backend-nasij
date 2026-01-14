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
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
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
        FormsModule,
        TextareaModule,
        UploadFilesComponent,
        CalendarModule,
        ToggleSwitchModule,
        PaginatorModule,
        TooltipModule,
        TranslateModule
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

    translate = inject(TranslateService);

    statusOptions: any[] = [];
    alwaysOptions: any[] = [];

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

    get formControlVideo(): FormControl {
        return this.heroForm?.get('video') as FormControl;
    }

    ngOnInit() {
        this.buildForm();
        this.loadHeroes();
        this.initializeOptions();
        this.updateColumns();
        
        this.translate.onLangChange.subscribe(() => {
            this.initializeOptions();
            this.updateColumns();
        });
    }

    initializeOptions() {
        this.statusOptions = [
            { label: this.translate.instant('common.active'), value: true },
            { label: this.translate.instant('common.inactive'), value: false }
        ];

        this.alwaysOptions = [
            { label: this.translate.instant('hero.alwaysActive'), value: true },
            { label: this.translate.instant('hero.scheduled'), value: false }
        ];
    }

    updateColumns() {
        this.cols = [
            { field: 'title', header: this.translate.instant('hero.title') },
            { field: 'subTitle', header: this.translate.instant('hero.subtitle') },
            { field: 'image', header: this.translate.instant('hero.image') },
            { field: 'video', header: this.translate.instant('hero.video') },
            { field: 'isAlways', header: this.translate.instant('hero.type') },
            { field: 'isActive', header: this.translate.instant('common.status') },
            { field: 'actions', header: this.translate.instant('common.actions') }
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
            video: [null],
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

    getStatusLabel(status: boolean): string {
        return status 
            ? this.translate.instant('common.active') 
            : this.translate.instant('common.inactive');
    }

    getTypeLabel(isAlways: boolean): string {
        return isAlways 
            ? this.translate.instant('hero.alwaysActive') 
            : this.translate.instant('hero.scheduled');
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
                severity: 'error', summary: this.translate.instant('common.error'), detail: this.translate.instant('hero.failedToLoad'), life: 1000
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
        const heroTitle = hero.title?.en || hero.title?.ar || hero._id;
        this.confirmationService.confirm({
            message: this.translate.instant('hero.confirmDelete', { title: heroTitle }),
            header: this.translate.instant('common.confirm'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.heroService.deleteHero(hero._id!).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.loadHeroes();
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: this.translate.instant('common.delete'), 
                            detail: this.translate.instant('hero.deletedSuccessfully') 
                        });
                    },
                    error: () => this.messageService.add({ 
                        severity: 'error', 
                        summary: this.translate.instant('common.error'), 
                        detail: this.translate.instant('hero.failedToDelete') 
                    })
                });
            }
        });
    }

    saveHero() {
        this.submitted = true;

        if (this.heroForm.invalid) {
            this.messageService.add({
                severity: 'error', summary: this.translate.instant('common.error'), detail: this.translate.instant('hero.fixFormErrors'), life: 1000
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
                    summary: formValue._id ? this.translate.instant('common.update') : this.translate.instant('common.create'),
                    detail: formValue._id ? this.translate.instant('hero.updatedSuccessfully') : this.translate.instant('hero.createdSuccessfully')
                });
                this.hideDialog();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error', summary: this.translate.instant('common.error'), detail: this.translate.instant('hero.failedToSave'), life: 1000
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