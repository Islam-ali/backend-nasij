import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule, FormControl } from '@angular/forms';

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
import { ChipsModule } from 'primeng/chips';
import { InputNumberModule } from 'primeng/inputnumber';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { Paginator } from "primeng/paginator";
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { EditorModule } from 'primeng/editor';
import { Skeleton } from "primeng/skeleton";

import { IPackage, CreatePackageDto, UpdatePackageDto } from '../../../interfaces/package.interface';
import { IProduct } from '../../../interfaces/product.interface';
import { PackageService } from '../../../services/package.service';
import { ProductsService } from '../../../services/products.service';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

@Component({
    selector: 'app-package-list',
    templateUrl: './package-list.component.html',
    styleUrls: ['./package-list.component.scss'],
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
        ChipsModule,
        InputNumberModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        FormsModule,
        TextareaModule,
        UploadFilesComponent,
        CardModule,
        ToggleSwitchModule,
        EditorModule,
        Skeleton
    ],
    providers: [MessageService, ConfirmationService, PackageService]
})
export class PackageListComponent extends ComponentBase implements OnInit {
    @ViewChild('dt') dt!: Table;

    packages = signal<IPackage[]>([]);
    loading = signal(false);
    selectedPackages = signal<IPackage[]>([]);
    packageDialog = signal(false);
    deletePackageDialog: boolean = false;
    deletePackagesDialog: boolean = false;
    package = signal<IPackage>({} as IPackage);
    submitted = signal(false);
    isEdit = signal(false);
    products = signal<IProduct[]>([]);
    loadingProducts = signal(false);

    cols!: Column[];
    exportColumns!: Column[];
    statuses!: any[];
    categories!: any[];
    brands!: any[];

    packageForm!: FormGroup;
    currentPage = 1;
    itemsPerPage = 10;
    totalItems = 0;

    constructor(
        private packageService: PackageService,
        private productsService: ProductsService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder
    ) {
        super();
    }

    ngOnInit() {
        this.initializeColumns();
        this.initializeForm();
        this.loadPackages();
        this.loadProducts();
    }

    initializeColumns() {
        this.cols = [
            { field: 'name', header: 'Name' },
            { field: 'price', header: 'Price' },
            { field: 'stock', header: 'Stock' },
            { field: 'items', header: 'Items Count' },
            { field: 'tags', header: 'Tags' },
            { field: 'isActive', header: 'Status' },
            { field: 'createdAt', header: 'Created Date' }
        ];

        this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field })) as unknown as Column[];
    }

    initializeForm() {
        this.packageForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(3)]],
            description: ['', [Validators.required, Validators.minLength(10)]],
            price: [0, [Validators.required, Validators.min(0)]],
            discountPrice: [0, [Validators.min(0)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            items: this.fb.array([]),
            images: [[]],
            tags: [[]],
            isActive: [true]
        });
    }

    get items() {
        return this.packageForm.get('items') as FormArray;
    }

    loadPackages() {
        this.loading.set(true);
        const queryParams = {
            page: this.currentPage,
            limit: this.itemsPerPage
        };

        this.packageService.getPackages(queryParams)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<{packages: IPackage[], pagination: pagination}>) => {
                    if (response.success) {
                        this.packages.set(response.data.packages);
                        this.totalItems = response.data.pagination?.total || 0;
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load packages'
                    });
                }
            });
    }

    loadProducts() {
        this.loadingProducts.set(true);
        this.productsService.getProductsList()
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loadingProducts.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<IProduct[]>) => {
                    if (response.success) {
                        this.products.set(response.data);
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to load products'
                    });
                }
            });
    }

    openNew() {
        this.package.set({} as IPackage);
        this.submitted.set(false);
        this.packageDialog.set(true);
        this.isEdit.set(false);
        this.initializeForm();
    }

    editPackage(packageItem: IPackage) {
        this.package.set({ ...packageItem });
        this.packageDialog.set(true);
        this.isEdit.set(true);
        this.populateForm(packageItem);
    }

    populateForm(packageItem: IPackage) {
        this.packageForm.patchValue({
            name: packageItem.name,
            description: packageItem.description,
            price: packageItem.price,
            discountPrice: packageItem.discountPrice,
            stock: packageItem.stock,
            images: packageItem.images,
            tags: packageItem.tags,
            isActive: packageItem.isActive,
            items: packageItem.items
        });

        // Clear existing items
        const itemsArray = this.packageForm.get('items') as FormArray;
        itemsArray.clear();

        // Add items
        packageItem.items.forEach(item => {
            itemsArray.push(this.createItemFormGroup(item));
        });
    }

    createItemFormGroup(item?: any) {
        return this.fb.group({
            productId: [item?.productId?._id || '', Validators.required],
            quantity: [item?.quantity || 1, [Validators.required, Validators.min(1)]],
            requiredVariantAttributes: this.fb.array([]),
            sku: [item?.sku || '']
        });
    }

    addItem() {
        const itemsArray = this.packageForm.get('items') as FormArray;
        itemsArray.push(this.createItemFormGroup());
    }

    removeItem(index: number) {
        const itemsArray = this.packageForm.get('items') as FormArray;
        itemsArray.removeAt(index);
    }

    hideDialog() {
        this.packageDialog.set(false);
        this.submitted.set(false);
    }

    savePackage() {
        this.submitted.set(true);

        if (this.packageForm.valid) {
            const packageData = this.packageForm.value;
            
            if (this.isEdit()) {
                this.updatePackage(packageData);
            } else {
                this.createPackage(packageData);
            }
        }
    }

    createPackage(packageData: CreatePackageDto) {
        this.loading.set(true);
        this.packageService.createPackage(packageData)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<IPackage>) => {
                    if (response.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Package created successfully'
                        });
                        this.hideDialog();
                        this.loadPackages();
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to create package'
                    });
                }
            });
    }

    updatePackage(packageData: UpdatePackageDto) {
        this.loading.set(true);
        this.packageService.updatePackage(this.package()._id!, packageData)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<IPackage>) => {
                    if (response.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Package updated successfully'
                        });
                        this.hideDialog();
                        this.loadPackages();
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to update package'
                    });
                }
            });
    }

    deletePackage(packageItem: IPackage) {
        this.deletePackageDialog = true;
        this.package.set(packageItem);
    }

    confirmDelete() {
        this.loading.set(true);
        this.packageService.deletePackage(this.package()._id!)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<any>) => {
                    if (response.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Success',
                            detail: 'Package deleted successfully'
                        });
                        this.deletePackageDialog = false;
                        this.loadPackages();
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete package'
                    });
                }
            });
    }

    confirmDeleteSelected() {
        this.deletePackagesDialog = true;
    }

    deleteSelectedPackages() {
        this.loading.set(true);
        const deletePromises = this.selectedPackages().map(packageItem => 
            this.packageService.deletePackage(packageItem._id!)
        );

        Promise.all(deletePromises)
            .then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: 'Success',
                    detail: 'Selected packages deleted successfully'
                });
                this.deletePackagesDialog = false;
                this.selectedPackages.set([]);
                this.loadPackages();
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: 'Failed to delete some packages'
                });
            })
            .finally(() => {
                this.loading.set(false);
            });
    }

    onPageChange(event: any) {
        this.currentPage = event.page + 1;
        this.itemsPerPage = event.rows;
        this.loadPackages();
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getSeverity(status: boolean): string {
        return status ? 'success' : 'danger';
    }

    getStatusLabel(status: boolean): string {
        return status ? 'Active' : 'Inactive';
    }

    getItemsCount(items: any[]): number {
        return items?.length || 0;
    }

    getTagsDisplay(tags: string[]): string {
        return tags?.join(', ') || '';
    }
} 