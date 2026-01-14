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
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { TooltipModule } from 'primeng/tooltip';
import { InputNumberModule } from 'primeng/inputnumber';
import { OrderListModule } from 'primeng/orderlist';

import { IMenuLink, MenuLinkType, MenuLinkStatus } from '../../../interfaces/menu-link.interface';
import { MenuLinkService } from '../../../services/menu-link.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { inject } from '@angular/core';

interface Column {
    field: string;
    header: string;
}

@Component({
    selector: 'app-menu-link-list',
    templateUrl: './menu-link-list.component.html',
    styleUrls: ['./menu-link-list.component.scss'],
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
        TooltipModule,
        InputNumberModule,
        OrderListModule,
        TranslateModule
    ],
    providers: [MessageService, ConfirmationService, MenuLinkService]
})
export class MenuLinkListComponent extends ComponentBase implements OnInit {
    menuLinkForm!: FormGroup;
    menuLinkDialog = false;
    submitted = false;
    loading = signal<boolean>(false);
    menuLinks = signal<IMenuLink[]>([]);

    translate = inject(TranslateService);

    typeOptions: any[] = [];
    statusOptions: any[] = [];
    methodOptions: any[] = [];

    @ViewChild('dt') dt: Table | undefined;
    cols!: Column[];

    constructor(
        private fb: FormBuilder,
        private menuLinkService: MenuLinkService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService
    ) {
        super();
    }

    ngOnInit() {
        this.buildForm();
        this.loadMenuLinks();
        this.initializeOptions();
        this.updateColumns();
        
        this.translate.onLangChange.subscribe(() => {
            this.initializeOptions();
            this.updateColumns();
        });
    }

    initializeOptions() {
        this.typeOptions = [
            { label: this.translate.instant('menuLink.type.textLink'), value: MenuLinkType.TEXT },
            { label: this.translate.instant('menuLink.type.dropdown'), value: MenuLinkType.DROPDOWN }
        ];

        this.statusOptions = [
            { label: this.translate.instant('common.active'), value: MenuLinkStatus.ACTIVE },
            { label: this.translate.instant('common.inactive'), value: MenuLinkStatus.INACTIVE }
        ];

        this.methodOptions = [
            { label: 'GET', value: 'GET' },
            { label: 'POST', value: 'POST' }
        ];
    }

    updateColumns() {
        this.cols = [
            { field: 'key', header: this.translate.instant('menuLink.key') },
            { field: 'title', header: this.translate.instant('menuLink.title') },
            { field: 'type', header: this.translate.instant('menuLink.type.label') },
            { field: 'status', header: this.translate.instant('common.status') },
            { field: 'order', header: this.translate.instant('menuLink.order') },
            { field: 'actions', header: this.translate.instant('common.actions') }
        ];
    }

    buildForm() {
        this.menuLinkForm = this.fb.group({
            _id: [null],
            key: ['', [Validators.required, Validators.pattern(/^[a-z0-9-_]+$/)]],
            type: [MenuLinkType.TEXT, Validators.required],
            status: [MenuLinkStatus.ACTIVE],
            order: [0, [Validators.required, Validators.min(0)]],
            title: this.fb.group({
                en: ['', Validators.required],
                ar: ['', Validators.required]
            }),
            url: [''],
            dropdownConfig: this.fb.group({
                apiUrl: [''],
                method: ['GET'],
                valueField: [''],
                labelField: this.fb.group({
                    en: [''],
                    ar: ['']
                }),
                urlTemplate: ['']
            })
        });

        // Show/hide fields based on type
        this.menuLinkForm.get('type')?.valueChanges.subscribe(type => {
            const urlControl = this.menuLinkForm.get('url');
            const dropdownConfig = this.menuLinkForm.get('dropdownConfig');
            const apiUrlControl = dropdownConfig?.get('apiUrl');
            const valueFieldControl = dropdownConfig?.get('valueField');
            const urlTemplateControl = dropdownConfig?.get('urlTemplate');
            const labelFieldEnControl = dropdownConfig?.get('labelField.en');
            const labelFieldArControl = dropdownConfig?.get('labelField.ar');

            if (type === MenuLinkType.TEXT) {
                urlControl?.setValidators([Validators.required]);
                dropdownConfig?.reset();
                apiUrlControl?.clearValidators();
                valueFieldControl?.clearValidators();
                urlTemplateControl?.clearValidators();
                labelFieldEnControl?.clearValidators();
                labelFieldArControl?.clearValidators();
            } else {
                urlControl?.clearValidators();
                urlControl?.setValue('');
                apiUrlControl?.setValidators([Validators.required]);
                valueFieldControl?.setValidators([Validators.required]);
                urlTemplateControl?.setValidators([Validators.required]);
                labelFieldEnControl?.setValidators([Validators.required]);
                labelFieldArControl?.setValidators([Validators.required]);
            }
            urlControl?.updateValueAndValidity();
            apiUrlControl?.updateValueAndValidity();
            valueFieldControl?.updateValueAndValidity();
            urlTemplateControl?.updateValueAndValidity();
            labelFieldEnControl?.updateValueAndValidity();
            labelFieldArControl?.updateValueAndValidity();
        });
    }

    loadMenuLinks() {
        this.loading.set(true);
        this.menuLinkService.getMenuLinks().pipe(
            takeUntil(this.destroy$),
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (res: BaseResponse<IMenuLink[]>) => {
                this.menuLinks.set(res.data);
            },
            error: () => this.messageService.add({
                severity: 'error', summary: this.translate.instant('common.error'), detail: this.translate.instant('menuLink.failedToLoad'), life: 3000
            })
        });
    }

    openNew() {
        this.menuLinkForm.reset();
        this.menuLinkForm.patchValue({
            type: MenuLinkType.TEXT,
            status: MenuLinkStatus.ACTIVE,
            order: this.menuLinks().length,
            title: { en: '', ar: '' },
            dropdownConfig: {
                method: 'GET',
                labelField: { en: '', ar: '' }
            }
        });
        this.menuLinkDialog = true;
    }

    editMenuLink(menuLink: IMenuLink) {
        this.menuLinkForm.patchValue({
            _id: menuLink._id,
            key: menuLink.key,
            type: menuLink.type,
            status: menuLink.status,
            order: menuLink.order,
            title: menuLink.title,
            url: menuLink.url || '',
            dropdownConfig: menuLink.dropdownConfig ? {
                apiUrl: menuLink.dropdownConfig.apiUrl,
                method: menuLink.dropdownConfig.method || 'GET',
                valueField: menuLink.dropdownConfig.valueField,
                labelField: menuLink.dropdownConfig.labelField,
                urlTemplate: menuLink.dropdownConfig.urlTemplate
            } : {
                method: 'GET',
                labelField: { en: '', ar: '' }
            }
        });
        this.menuLinkDialog = true;
    }

    deleteMenuLink(menuLink: IMenuLink) {
        this.confirmationService.confirm({
            message: this.translate.instant('menuLink.confirmDelete', { key: menuLink.key }),
            header: this.translate.instant('common.confirm'),
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.menuLinkService.deleteMenuLink(menuLink._id!).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.loadMenuLinks();
                        this.messageService.add({ 
                            severity: 'success', 
                            summary: this.translate.instant('common.delete'), 
                            detail: this.translate.instant('menuLink.deletedSuccessfully') 
                        });
                    },
                    error: () => this.messageService.add({ 
                        severity: 'error', 
                        summary: this.translate.instant('common.error'), 
                        detail: this.translate.instant('menuLink.failedToDelete') 
                    })
                });
            }
        });
    }

    saveMenuLink() {
        this.submitted = true;

        if (this.menuLinkForm.invalid) {
            this.messageService.add({
                severity: 'error', summary: this.translate.instant('common.error'), detail: this.translate.instant('menuLink.fixFormErrors'), life: 3000
            });
            return;
        }

        const formValue = this.menuLinkForm.value;
        
        // Clean up dropdownConfig if type is TEXT
        if (formValue.type === MenuLinkType.TEXT) {
            formValue.dropdownConfig = undefined;
        } else {
            // Clean up url if type is DROPDOWN
            formValue.url = undefined;
        }

        const request$ = formValue._id
            ? this.menuLinkService.updateMenuLink(formValue._id, formValue)
            : this.menuLinkService.createMenuLink(formValue);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: BaseResponse<IMenuLink>) => {
                this.loadMenuLinks();
                this.messageService.add({
                    severity: 'success',
                    summary: formValue._id ? this.translate.instant('common.update') : this.translate.instant('common.create'),
                    detail: formValue._id ? this.translate.instant('menuLink.updatedSuccessfully') : this.translate.instant('menuLink.createdSuccessfully')
                });
                this.hideDialog();
            },
            error: (error) => {
                this.messageService.add({
                    severity: 'error', summary: this.translate.instant('common.error'), detail: error.error?.message || this.translate.instant('menuLink.failedToSave'), life: 3000
                });
            }
        });
    }

    hideDialog() {
        this.menuLinkDialog = false;
        this.submitted = false;
        this.menuLinkForm.reset();
    }

    onGlobalFilter(dt: Table, event: any): void {
        dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getSeverity(status: MenuLinkStatus) {
        return status === MenuLinkStatus.ACTIVE ? 'success' : 'danger';
    }

    getTypeSeverity(type: MenuLinkType) {
        return type === MenuLinkType.TEXT ? 'info' : 'warning';
    }

    getTypeLabel(type: MenuLinkType): string {
        return type === MenuLinkType.TEXT 
            ? this.translate.instant('menuLink.type.text') 
            : this.translate.instant('menuLink.type.dropdown');
    }

    getStatusLabel(status: MenuLinkStatus): string {
        return status === MenuLinkStatus.ACTIVE 
            ? this.translate.instant('common.active') 
            : this.translate.instant('common.inactive');
    }

    get getType() {
        return this.menuLinkForm?.get('type')?.value;
    }
}

