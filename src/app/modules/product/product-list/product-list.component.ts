import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule, FormControl, AbstractControl } from '@angular/forms';

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
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { EditorModule } from 'primeng/editor';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { SupportedLanguage } from '../../../interfaces/banner.interface';

export enum EnumProductVariant {
    SIZE = 'size',
    COLOR = 'color',
}

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
        ToggleSwitchModule,
        EditorModule,
        MultiLanguagePipe
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

    variantOptions = [
        { label: 'Size', value: EnumProductVariant.SIZE },
        { label: 'Color', value: EnumProductVariant.COLOR }
    ];

    @ViewChild('dt') dt: Table | undefined;
    exportColumns!: ExportColumn[];
    cols!: Column[];
    currentLanguage = signal<SupportedLanguage>('en');
    languages = signal<{label: string, value: SupportedLanguage}[]>([
        { label: 'English', value: 'en' },
        { label: 'العربية', value: 'ar' }
    ]);

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

    formControlImageVariant(variantIndex: number, attributeIndex: number): FormControl {
        return this.getAttribute(variantIndex)?.at(attributeIndex).get('image') as FormControl;
    }

    // get attribute by index
    getAttribute(variantIndex: number): FormArray {
        return this.variants.at(variantIndex).get('attributes') as FormArray;
    }


    get availableImages() {
        return this.productForm?.get('images')?.value || [];
    }
    

    ngOnInit() {
        this.buildForm();
        this.loadProducts();
        this.loadCategories();
        this.loadBrands();
        this.checkUseVariantPrice();
        this.cols = [
            { field: 'code', header: 'Code' },
            { field: 'name', header: 'Name' },
            { field: 'image', header: 'Image' },
            { field: 'price', header: 'Price' },
            { field: 'category', header: 'Category' }
        ];
        this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
        this.productForm.valueChanges.subscribe((value: any) => {
            console.log('Frontend - Images value:', value);
        });
    }

    checkUseVariantPrice(): void {
        this.productForm.get('useVariantPrice')?.valueChanges.subscribe((value: boolean) => {
            const variantsArray = this.productForm.get('variants') as FormArray;
            variantsArray.controls.forEach((control: AbstractControl) => {
                const variant = control as FormGroup;
                const priceControl = variant.get('price');

                if (value) {
                    priceControl?.setValidators([Validators.required, Validators.min(1)]);
                } else {
                    priceControl?.clearValidators();
                }
                priceControl?.updateValueAndValidity({ emitEvent: false });
            });
        });
    }

    sumStock(): number {
        return this.variants.controls.reduce((sum: number, variant: AbstractControl) => {
            return sum + (variant as FormGroup).get('stock')?.value;
        }, 0);
    }

    onStockInput(event: any): void {
        const totalStock = this.sumStock();
        this.productForm.get('stock')?.setValue(totalStock, { emitEvent: false });
        this.productForm.updateValueAndValidity();
    }


    buildForm() {
        this.productForm = this.fb.group({
            _id: [null],
            name: this.fb.group({
                en: ['', Validators.required],
                ar: ['', Validators.required]
            }),
            description: this.fb.group({
                en: ['', Validators.required],
                ar: ['', Validators.required]
            }),
            price: [0, [Validators.required, Validators.min(0)]],
            discountPrice: [0, [Validators.min(0)]],
            factoryPrice: [0, [Validators.min(0)]],
            category: [''],
            brand: [''],
            images: [null, [Validators.required]],
            variants: this.fb.array([]),
            stock: [0, [Validators.required, Validators.min(0)]],
            status: [ProductStatus.ACTIVE],
            tags: [[]],
            gender: [''],
            season: [''],
            details: this.fb.array([]),
            seoTitle: this.fb.group({
                en: ['', Validators.required],
                ar: ['', Validators.required]
            }),
            seoDescription: this.fb.group({
                en: ['', Validators.required],
                ar: ['', Validators.required]
            }),
            seoKeywords: [[]],
            useVariantPrice: [false],
        });
    }

    get variants(): FormArray {
        return this.productForm?.get('variants') as FormArray;
    }

    get details(): FormArray {
        return this.productForm?.get('details') as FormArray;
    }

    getAttributes(variantIndex: number): FormArray {
        return this.variants.at(variantIndex).get('attributes') as FormArray;
    }

    addAttribute(variantIndex: number): void {
        const attributeGroup = this.fb.group({
            variant: [EnumProductVariant.SIZE, [Validators.required]],
            value: this.fb.group({
                en: ['', [Validators.required, Validators.minLength(1)]],
                ar: ['', [Validators.required, Validators.minLength(1)]]
            }),
            image: [null]
        });
        this.getAttributes(variantIndex).push(attributeGroup);
    }

    removeAttribute(variantIndex: number, attributeIndex: number): void {
        this.getAttributes(variantIndex).removeAt(attributeIndex);
    }

    addDetail(): void {
        const detailGroup = this.fb.group({
            name: this.fb.group({
                en: ['', [Validators.required, Validators.minLength(2)]],
                ar: ['', [Validators.required, Validators.minLength(2)]]
            }),
            value: this.fb.group({
                en: ['', [Validators.required, Validators.minLength(2)]],
                ar: ['', [Validators.required, Validators.minLength(2)]]
            }),
        });
        this.details.push(detailGroup);
    }

    removeDetail(index: number): void {
        this.details.removeAt(index);
    }

    addVariant(): void {
        const price = this.productForm.get('useVariantPrice')?.value ? 0 : this.productForm.get('price')?.value;
        const variantGroup = this.fb.group({
            attributes: this.fb.array([
                this.fb.group({
                    variant: [EnumProductVariant.SIZE, [Validators.required]],
                    value: this.fb.group({
                        en: ['', [Validators.required, Validators.minLength(1)]],
                        ar: ['', [Validators.required, Validators.minLength(1)]]
                    }),
                    image: [null]
                })
            ]),
            price: [price, [Validators.required, Validators.min(0)]],
            stock: [0, [Validators.required, Validators.min(0)]],
            sku: ['', [Validators.pattern(/^[A-Za-z0-9-]+$/)]],
            image: [null]
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
                    severity: 'error', summary: 'Error', detail: 'Failed to load products', life: 1000
                })
            });
    }

    loadCategories() {
        this.categoryService.listCategories().pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: any) => {
                this.categoryOptions = res.data.map((cat: any) => ({ label: cat.name.en, value: cat._id }));
            },
            error: () => this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Failed to load categories', life: 1000
            })
        });
    }

    loadBrands() {
        this.brandService.listBrands().pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: any) => {
                this.brandOptions = res.data.map((brand: any) => ({ label: brand.name, value: brand._id }));
            },
            error: () => this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Failed to load brands', life: 1000
            })
        });
    }

    openNew() {
        this.productForm.reset();
        this.productForm.patchValue({
            name: { en: '', ar: '' },
            description: { en: '', ar: '' },
            status: ProductStatus.ACTIVE,
            price: 0,
            stock: 0,
            seoTitle: { en: '', ar: '' },
            seoDescription: { en: '', ar: '' },
            dimensions: { length: 0, width: 0, height: 0 }
        });
        this.productDialog = true;
    }

    editProduct(product: IProduct) {
        // Handle multilingual fields
        this.productForm.patchValue({
            _id: product._id,
            name: {
                en: product.name?.en || product.name || '',
                ar: product.name?.ar || product.name || ''
            },
            description: {
                en: product.description?.en || product.description || '',
                ar: product.description?.ar || product.description || ''
            },
            images: product.images,
            price: product.price,
            discountPrice: product.discountPrice,
            factoryPrice: (product as any).factoryPrice || 0,
            stock: product.stock,
            status: product.status,
            tags: product.tags,
            gender: product.gender,
            season: product.season,
            useVariantPrice: product.useVariantPrice,
            seoTitle: {
                en: product.seoTitle?.en || product.seoTitle || '',
                ar: product.seoTitle?.ar || product.seoTitle || ''
            },
            seoDescription: {
                en: product.seoDescription?.en || product.seoDescription || '',
                ar: product.seoDescription?.ar || product.seoDescription || ''
            },
            seoKeywords: product.seoKeywords
        });

        this.productForm.get('category')?.setValue(product?.category?._id || null);
        this.productForm.get('brand')?.setValue(product?.brand?._id || null);

        // add variants to form
        this.variants.clear();
        product.variants.forEach((variant: any) => {
            const variantGroup = this.fb.group({
                attributes: this.fb.array([]),
                price: variant.price,
                stock: variant.stock,
                sku: variant.sku,
                image: variant.image
            });

            // Add attributes to the variant
            if (variant.attributes && variant.attributes.length > 0) {
                variant.attributes.forEach((attr: any) => {
                    const attributeGroup = this.fb.group({
                        variant: attr.variant,
                        value: this.fb.group({
                            en: attr.value?.en || attr.value || '',
                            ar: attr.value?.ar || attr.value || ''
                        }),
                        image: attr.image
                    });
                    (variantGroup.get('attributes') as FormArray).push(attributeGroup);
                });
            } else {
                // Handle legacy variant structure (single variant/value)
                const attributeGroup = this.fb.group({
                    variant: variant.variant || 'size',
                    value: this.fb.group({
                        en: variant.value?.en || variant.value || '',
                        ar: variant.value?.ar || variant.value || ''
                    }),
                    image: variant.image
                });
                (variantGroup.get('attributes') as FormArray).push(attributeGroup);
            }

            this.variants.push(variantGroup);
        });

        // add details to form
        this.details.clear();
        if (product.details) {
            product.details.forEach((detail: any) => {
                this.details.push(this.fb.group({
                    name: {
                        en: detail.name?.en || detail.name || '',
                        ar: detail.name?.ar || detail.name || ''
                    },
                    value: {
                        en: detail.value?.en || detail.value || '',
                        ar: detail.value?.ar || detail.value || ''
                    }
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
        console.log('Frontend - Form value:', this.productForm.value);
        console.log('Frontend - Form valid:', this.productForm.valid);
        console.log('Frontend - Form errors:', this.productForm.errors);

        if (this.productForm.invalid) {
            console.log('Frontend - Form is invalid');
            this.messageService.add({
                severity: 'error', summary: 'Error', detail: 'Please fix form errors', life: 1000
            });
            return;
        }

        const formValue = this.productForm.value;
        console.log('Frontend - Sending data to backend:', JSON.stringify(formValue, null, 2));
        
        // Process variants to handle image arrays
        if (formValue.variants) {
            formValue.variants.forEach((variant: any) => {
                if (variant.image && variant.image.length > 0) {
                    variant.image = variant.image[0];
                }
                // Process variant attributes
                if (variant.attributes) {
                    variant.attributes.forEach((attr: any) => {
                        if (attr.image && attr.image.length > 0) {
                            attr.image = attr.image[0];
                        }
                    });
                }
            });
        }
        const request$ = formValue._id
            ? this.productsService.updateProduct(formValue._id, formValue)
            : this.productsService.createProduct(formValue);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: BaseResponse<any>) => {
                console.log('Frontend - Backend response:', res);
                this.loadProducts();
                this.messageService.add({
                    severity: 'success',
                    summary: formValue._id ? 'Updated' : 'Created',
                    detail: `Product ${formValue._id ? 'updated' : 'created'} successfully`
                });
                this.hideDialog();
            },
            error: (error) => {
                console.log('Frontend - Backend error:', error);
                this.messageService.add({
                    severity: 'error', summary: 'Error', detail: 'Save failed', life: 1000
                });
            }
        });
    }

    hideDialog() {
        this.productDialog = false;
        this.submitted = false;
        this.productForm.reset();
        // Reset form with multilingual structure
        this.productForm.patchValue({
            name: { en: '', ar: '' },
            description: { en: '', ar: '' },
            seoTitle: { en: '', ar: '' },
            seoDescription: { en: '', ar: '' }
        });
    }

    onLanguageChange(event: any): void {
        this.currentLanguage.set(event.value);
    }

    getVariantIcon(variantType: EnumProductVariant): string {
        switch (variantType) {
            case 'size':
                return 'pi-arrows-alt';
            case 'color':
                return 'pi-palette';
            // case 'material':
            //     return 'pi-box';
            // case 'style':
            //     return 'pi-star';
            default:
                return 'pi-tag';
        }
    }
}
