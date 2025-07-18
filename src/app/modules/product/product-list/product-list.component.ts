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
import { RatingModule } from 'primeng/rating';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { ChipsModule } from 'primeng/chips';
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { RadioButtonModule } from 'primeng/radiobutton';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { AccordionModule } from 'primeng/accordion';
import { DividerModule } from 'primeng/divider';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';

import { IProduct, ProductStatus } from '../../../interfaces/product.interface';
import { CategoryService } from '../../../services/category.service';
import { BrandService } from '../../../services/brand.service';
import { ProductsService } from '../../../services/products.service';
import { FallbackImgDirective } from '../../../core/directives/fallback-img.directive';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { UploadFilesComponent } from '../../../shared/components/fields/upload-files/upload-files.component';
import { Paginator } from "primeng/paginator";
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { Skeleton } from "primeng/skeleton";

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

interface ExportColumn {
    title: string;
    dataKey: string;
}

@Component({
    selector: 'app-product-list',
    templateUrl: './product-list.component.html',
    styleUrls: ['./product-list.component.scss'],
    standalone: true,
    imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    RatingModule,
    InputTextModule,
    DropdownModule,
    ChipsModule,
    InputNumberModule,
    SelectModule,
    RadioButtonModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    FallbackImgDirective,
    FormsModule,
    TextareaModule,
    UploadFilesComponent,
    AccordionModule,
    DividerModule,
    CardModule,
    PanelModule,
    Paginator,
],
    providers: [MessageService, ConfirmationService, ProductsService]
})
export class ProductListComponent extends ComponentBase implements OnInit {
    productForm!: FormGroup;
    productDialog = false;
    submitted = false;
    selectedProducts!: IProduct[] | null;
    loading = signal<boolean>(false);
    products = signal<IProduct[]>([]);
    pagination = signal<pagination>({
        page: 1,
        limit: 5,
        total: 0,
        pages: 0
    });
    categoryOptions: any[] = [];
    brandOptions: any[] = [];
    loadingExport: boolean = false;

    statusOptions = [
        { label: 'Active', value: ProductStatus.ACTIVE },
        { label: 'Inactive', value: ProductStatus.INACTIVE },
        { label: 'Out of Stock', value: ProductStatus.OUT_OF_STOCK }
    ];

    genderOptions = [
        { label: 'Men', value: 'men' },
        { label: 'Women', value: 'women' },
        { label: 'Kids', value: 'kids' }
    ];

    seasonOptions = [
        { label: 'Spring', value: 'spring' },
        { label: 'Summer', value: 'summer' },
        { label: 'Fall', value: 'fall' },
        { label: 'Winter', value: 'winter' }
    ];

    @ViewChild('dt') dt: Table | undefined;
    exportColumns!: ExportColumn[];
    cols!: Column[];

    constructor(
        private fb: FormBuilder,
        private productsService: ProductsService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private categoryService: CategoryService,
        private brandService: BrandService
    ) {
        super();
    }

    get formControlImage(): FormControl {
        return this.productForm?.get('images') as FormControl;
    }

    ngOnInit() {
        this.buildForm();
        this.loadProducts();
        this.loadCategories();
        this.loadBrands();
        this.cols = [
            { field: 'code', header: 'Code' },
            { field: 'name', header: 'Name' },
            { field: 'image', header: 'Image' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' }
        ];
        this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
    }

    buildForm() {
        this.productForm = this.fb.group({
            _id: [null],
            name: ['', Validators.required],
            discountPrice: [0, [Validators.required, Validators.min(0)]],
            description: ['', Validators.required],
            price: [0, [Validators.required, Validators.min(0)]],
            factoryPrice: [0, [Validators.required, Validators.min(0)]],
            category: ['', Validators.required],
            brand: ['', Validators.required],
            images: [null, [Validators.required]],
            variants: this.fb.array([]),
            stock: [0, [Validators.required, Validators.min(0)]],
            status: [ProductStatus.ACTIVE],
            sku: ['', Validators.required],
            tags: [[]],
            colors: [[]],
            size: [[]],
            season: [[]],
            gender: [''],
            details: this.fb.array([]),
            material: [''],
            seoTitle: ['', Validators.required],
            seoDescription: ['', Validators.required],
            seoKeywords: [''],
            dimensions: this.fb.group({
                length: [0, Validators.min(0)],
                width: [0, Validators.min(0)],
                height: [0, Validators.min(0)]
            })
        });
    }

    get variants(): FormArray {
        return this.productForm?.get('variants') as FormArray;
    }

    get details(): FormArray {
        return this.productForm?.get('details') as FormArray;
    }

    addDetail(): void {
        const detailGroup = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            value: ['', [Validators.required, Validators.minLength(2)]],
        });
        this.details.push(detailGroup);
    }

    removeDetail(index: number): void {
        this.details.removeAt(index);
    }

    addVariant(): void {
        const variantGroup = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            value: ['', [Validators.required, Validators.minLength(2)]],
            price: [0, [Validators.required, Validators.min(0)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            sku: ['', [Validators.required, Validators.pattern(/^[A-Za-z0-9-]+$/)]],
        });
        this.variants.push(variantGroup);
    }

    removeVariant(index: number): void {
        this.variants.removeAt(index);
    }

    getSeverity(status: string) {
        switch (status) {
            case ProductStatus.ACTIVE:
                return 'success';
            case ProductStatus.INACTIVE:
                return 'warn';
            case ProductStatus.OUT_OF_STOCK:
                return 'danger';
            default:
                return 'info';
        }
    }

    onGlobalFilter(dt: Table, event: any): void {
        dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    loadProducts(page: number = 0, limit: number = 5) {
        this.loading.set(true);
        this.productsService.getProducts({
            limit: limit,
            page: page + 1
        }).pipe(
            takeUntil(this.destroy$),
            finalize(() => this.loading.set(false))).subscribe({
                next: (res: any) => {
                    this.products.set(res.data.products);
                    this.pagination.set(res.data.pagination);
                },
                error: () => this.messageService.add({
                    severity: 'error', summary: 'Error', detail: 'Failed to load products', life: 3000
                })
            });
    }

    loadCategories() {
        this.categoryService.listCategories().pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: any) => {
                this.categoryOptions = res.data.map((cat: any) => ({ label: cat.name, value: cat._id }));
            },
            error: () => this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Failed to load categories', life: 3000
            })
        });
    }

    loadBrands() {
        this.brandService.listBrands().pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: any) => {
                this.brandOptions = res.data.map((brand: any) => ({ label: brand.name, value: brand._id }));
            },
            error: () => this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Failed to load brands', life: 3000
            })
        });
    }

    openNew() {
        this.productForm.reset();
        this.productForm.patchValue({
            status: ProductStatus.ACTIVE,
            price: 0,
            stock: 0,
            dimensions: { length: 0, width: 0, height: 0 }
        });
        this.productDialog = true;
    }

    editProduct(product: IProduct) {
        this.productForm.patchValue(product);

        this.productForm.get('category')?.setValue(product?.category?._id || null);
        this.productForm.get('brand')?.setValue(product?.brand?._id || null);

        // add variants to form
        this.variants.clear();
        product.variants.forEach((variant: any) => {
            this.variants.push(this.fb.group({
                name: variant.name,
                value: variant.value,
                price: variant.price,
                stock: variant.stock,
                sku: variant.sku
            }));
        });

        // add details to form
        this.details.clear();
        if (product.details) {
            product.details.forEach((detail: any) => {
                this.details.push(this.fb.group({
                    name: detail.name,
                    value: detail.value
                }));
            });
        }

        this.productDialog = true;
    }

    deleteProduct(product: IProduct) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete ${product.name}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.productsService.deleteProduct(product._id!).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.loadProducts();
                        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Product deleted' });
                    },
                    error: () => this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Delete failed' })
                });
            }
        });
    }

    saveProduct() {
        this.submitted = true;
        if (this.productForm.invalid) {
            this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Please fix form errors', life: 3000
            });
            return;
        }

        const formValue = this.productForm.value;
        const request$ = formValue._id
            ? this.productsService.updateProduct(formValue._id, formValue)
            : this.productsService.createProduct(formValue);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: BaseResponse<any>) => {
                this.loadProducts();
                this.messageService.add({
                    severity: 'success',
                    summary: formValue._id ? 'Updated' : 'Created',
                    detail: `Product ${formValue._id ? 'updated' : 'created'} successfully`
                });
                this.hideDialog();
            },
            error: () => this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Save failed', life: 3000
            })
        });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
        this.productForm.reset();
    }
}
