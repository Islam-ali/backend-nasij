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
import { InputNumberModule } from 'primeng/inputnumber';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { CardModule } from 'primeng/card';
import { PanelModule } from 'primeng/panel';
import { Paginator, PaginatorModule } from 'primeng/paginator';
import { CheckboxModule } from 'primeng/checkbox';

import { Order, OrderStatus, PaymentMethod, PaymentStatus, OrderItem, OrderItemType } from '../../../interfaces/order.interface';
import { OrderService } from '../../../services/order.service';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { TextareaModule } from 'primeng/textarea';
import { ProductsService } from '../../../services/products.service';
import { IProduct } from '../../../interfaces/product.interface';
import { IPackage } from '../../../interfaces/package.interface';
import { PackageService } from '../../../services/package.service';
import { ICountry } from '../../../interfaces/country.interface';
import { IState } from '../../../interfaces/state.interface';
import { CountryService } from '../../../services/country.service';
import { StateService } from '../../../services/state.service';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { environment } from '../../../../environments/environment';
import { UploadFilesComponent } from "../../../shared/components/fields/upload-files/upload-files.component";
import { UploadFilesService } from '../../../shared/components/fields/upload-files/upload-files.service';
import { Archived } from '../../../shared/components/fields/models/Archived';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { HttpEvent } from '@angular/common/http';

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
    selector: 'app-order-list',
    templateUrl: './order-list.component.html',
    styleUrls: ['./order-list.component.scss'],
    standalone: true,
    imports: [
    CommonModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    TextareaModule,
    InputTextModule,
    DropdownModule,
    InputNumberModule,
    SelectModule,
    DialogModule,
    TagModule,
    InputIconModule,
    IconFieldModule,
    ConfirmDialogModule,
    CardModule,
    PanelModule,
    PaginatorModule,
    CheckboxModule,
    FormsModule,
    MultiLanguagePipe,
    UploadFilesComponent
],
    providers: [MessageService, ConfirmationService, OrderService, PackageService, UploadFilesService]  
})
export class OrderListComponent extends ComponentBase implements OnInit {
    orderForm!: FormGroup;
    orderDialog = false;
    submitted = false;
    selectedOrders: Order[] = [];
    loading = signal<boolean>(false);
    orders = signal<Order[]>([]);
    isEditOrder: boolean = false;
    pagination = signal<pagination>({
        page: 1,
        limit: 10,
        total: 0,
        pages: 0
    });
    loadingExport: boolean = false;

    // Filter properties
    selectedOrderStatus = signal<OrderStatus | null>(null);
    selectedPaymentStatus = signal<PaymentStatus | null>(null);
    selectedPaymentMethod = signal<PaymentMethod | null>(null);
    orderNumberFilter = signal<string>('');

    // Variant editing properties
    variantDialog = false;
    selectedItemIndex: number | null = null;
    availableVariants: any[] = [];
    tempSelectedVariants: any[] = [];
    
    // Package variant editing properties
    packageVariantDialog = false;
    selectedPackageItemIndex: number | null = null;
    selectedPackageProductIndex: number | null = null;
    tempPackageVariants: any[] = [];
    
    // Package details dialog properties
    packageDetailsDialog = false;
    selectedPackageForDetails: any = null;
    tempPackageItems: any[] = [];
    currentPackageItemIndex: number = -1;
    expandedProductIndex: number = -1; // Track which product has expanded variants
    productVariantsCache: { [key: string]: any[] } = {}; // Cache variants for each product

    // removed timeline feature

    // Image preview properties
    imagePreviewDialog = false;
    previewImageUrl: string = '';
    previewImageTitle: string = '';

    statusOptions = [
        { label: 'قيد الانتظار', value: OrderStatus.PENDING },
        { label: 'تم التأكيد', value: OrderStatus.CONFIRMED },
        { label: 'تم الشحن', value: OrderStatus.SHIPPED },
        { label: 'تم التسليم', value: OrderStatus.DELIVERED },
        { label: 'تم الإلغاء', value: OrderStatus.CANCELLED },
        { label: 'تم التأجيل', value: OrderStatus.POSTPONED },
        { label: 'تم الإرجاع', value: OrderStatus.RETURNED }        
    ];

    paymentStatusOptions = [
        { label: 'قيد الانتظار', value: PaymentStatus.PENDING },
        { label: 'تم الدفع', value: PaymentStatus.PAID },
        { label: 'فشل الدفع', value: PaymentStatus.FAILED },
        { label: 'تم الاسترجاع', value: PaymentStatus.REFUNDED }
    ];
    PaymentMethod = PaymentMethod;

    paymentMethodOptions = [
        { label: 'نقدي', value: PaymentMethod.CASH },
        { label: 'فودافون كاش', value: PaymentMethod.VODAFONE_CASH }
    ];

    countryOptions = signal<ICountry[]>([]);
    stateOptions = signal<IState[]>([]);
    @ViewChild('dt') dt: Table | undefined;
    exportColumns!: ExportColumn[];
    cols!: Column[];
    products = signal<IProduct[]>([]);
    packages = signal<IPackage[]>([]);
    constructor(
        private fb: FormBuilder,
        private orderService: OrderService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productService: ProductsService,
        private packageService: PackageService,
        private countryService: CountryService,
        private stateService: StateService,
        private _uploadFilesService: UploadFilesService,
    ) {
        super();
    }

    ngOnInit() {
        this.buildForm();
        this.loadOrders();
        this.loadProducts();
        this.loadPackages();
        this.loadCountries();
        this.cols = [
            { field: 'orderNumber', header: 'Order #' },
            { field: 'customer', header: 'Customer' },
            { field: 'total', header: 'Total' },
            { field: 'status', header: 'Status' },
            { field: 'paymentStatus', header: 'Payment Status' },
            { field: 'createdAt', header: 'Date' }
        ];
        this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field }));
    }
    loadCountries() {
        this.countryService.getCountries().subscribe((countries: any) => {
            this.countryOptions.set(countries.data);
        });
    }
    loadStates() {
        this.stateService.getStatesByCountry(this.orderForm.get('shippingAddress')?.value.country).subscribe((states: any) => {
            this.stateOptions.set(states.data);
        });
    }

    // add cashPayment to orderForm if editOrder , else remove cashPayment
    buildForm() {
        this.orderForm = this.fb.group({
            _id: [null],
            items: this.fb.array([], Validators.required),
            subtotal: [0, [Validators.required, Validators.min(0)]],
            tax: [0, [Validators.required, Validators.min(0)]],
            shippingCost: [0],
            total: [0, [Validators.required, Validators.min(0.01)]],
            cashPayment: this.fb.group({
                amountPaid: [0, [Validators.required, Validators.min(0)]],
                changeDue: [0],
                paymentImage: [''],
            }),
            orderStatus: [OrderStatus.PENDING, Validators.required],
            paymentStatus: [PaymentStatus.PENDING, Validators.required],
            paymentMethod: [PaymentMethod.CASH, Validators.required],
            shippingAddress: this.fb.group({
                fullName: ['', Validators.required],
                phone: ['', Validators.required],
                address: ['', Validators.required],
                city: ['', Validators.required],
                state: ['', Validators.required],
                country: ['', Validators.required]
            }),
            notes: [''],
            deliveredAt: [null]
        });
    }
    get cashPayment(): FormGroup {
        return this.orderForm?.get('cashPayment') as FormGroup;
    }
    get items(): FormArray {
        return this.orderForm.get('items') as FormArray;
    }
    calculateChangeDue() {
        const amountPaid = this.cashPayment.get('amountPaid')?.value || 0;
        const total = this.orderForm.get('total')?.value || 0;
        const changeDue = amountPaid - total;
        this.cashPayment.get('changeDue')?.setValue(changeDue);
    }

    addItem(): void {
        const itemGroup = this.fb.group({
            itemType: [OrderItemType.PRODUCT, Validators.required],
            itemId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            price: [0, [Validators.required, Validators.min(0)]],
            totalPrice: [0, [Validators.required, Validators.min(0)]],
            discountPrice: [0, [Validators.min(0)]],
            packageItems: [[]],
            selectedVariants: [[]]
        });
        this.items.push(itemGroup);
        this.calculateTotal();
    }

    removeItem(index: number): void {
        this.items.removeAt(index);
        this.calculateTotal();
    }

    setShippingCost() {
        const state = this.orderForm.get('shippingAddress')?.value.state;
        const shippingCost = this.orderForm.get('shippingCost');
        if (state) {
            const stateData = this.stateOptions().find((s: any) => s._id === state);
            shippingCost?.setValue(stateData?.shippingCost || 0);
        }
    }


    getSeverity(status: OrderStatus) {
        switch (status) {
            case OrderStatus.DELIVERED:
                return 'success';
            case OrderStatus.CONFIRMED:
                return 'info';
            case OrderStatus.SHIPPED:
                return 'info';
            case OrderStatus.PENDING:
                return 'warn';
            case OrderStatus.CANCELLED:
                return 'danger';
            case OrderStatus.POSTPONED:
                return 'warn';
            case OrderStatus.RETURNED:
                return 'danger';
            default:
                return 'info';
        }
        
    }

    getPaymentSeverity(status: string) {
        switch (status) {
            case PaymentStatus.PAID:
                return 'success';
            case PaymentStatus.PENDING:
                return 'warn';
            case PaymentStatus.FAILED:
                return 'danger';
            case PaymentStatus.REFUNDED:
                return 'info';
            default:
                return 'info';
        }
    }

    getPaymentMethodSeverity(method: string) {
        switch (method) {
            case PaymentMethod.CASH:
                return 'success';
            case PaymentMethod.VODAFONE_CASH:
                return 'info';
            case PaymentMethod.CREDIT_CARD:
            case PaymentMethod.DEBIT_CARD:
                return 'primary';
            case PaymentMethod.PAYPAL:
            case PaymentMethod.STRIPE:
                return 'secondary';
            case PaymentMethod.BANK_TRANSFER:
                return 'warning';
            case PaymentMethod.WALLET:
                return 'help';
            default:
                return 'info';
        }
    }

    viewPaymentImage(imageUrl: string): void {
        // Open image in a new window/tab
        window.open(imageUrl, '_blank');
    }

    /**
     * Filters the orders table based on user input for specific columns
     * @param event The input event containing the filter value
     * @param field The field to filter on
     */
    filterOrders(event: Event, field: string): void {
        const input = event.target as HTMLInputElement;
        if (input && this.dt) {
            this.dt.filter(input.value, field, 'contains');
        }
    }

    /**
     * Filter orders by order status
     * @param status The order status to filter by
     */
    onOrderStatusFilter(status: OrderStatus | null): void {
        this.selectedOrderStatus.set(status);
        this.applyFilters();
    }

    /**
     * Filter orders by payment status
     * @param status The payment status to filter by
     */
    onPaymentStatusFilter(status: PaymentStatus | null): void {
        this.selectedPaymentStatus.set(status);
        this.applyFilters();
    }

    /**
     * Filter orders by payment method
     * @param method The payment method to filter by
     */
    onPaymentMethodFilter(method: PaymentMethod | null): void {
        this.selectedPaymentMethod.set(method);
        this.applyFilters();
    }

    /**
     * Filter orders by order number
     * @param orderNumber The order number to filter by
     */
    onOrderNumberFilter(orderNumber: string): void {
        this.orderNumberFilter.set(orderNumber);
        this.applyFilters();
    }

    /**
     * Apply all active filters and reload orders
     */
    applyFilters(): void {
        this.pagination.set({
            ...this.pagination(),
            page: 1 // Reset to first page when applying filters
        });
        this.loadOrders();
    }

    /**
     * Clear all filters and reload orders
     */
    clearFilters(): void {
        this.selectedOrderStatus.set(null);
        this.selectedPaymentStatus.set(null);
        this.selectedPaymentMethod.set(null);
        this.orderNumberFilter.set('');
        this.applyFilters();
    }

    loadOrders() {
        this.loading.set(true);
        const filters: any = {
            limit: this.pagination().limit,
            page: this.pagination().page
        };

        // Add filter parameters if they are set
        if (this.selectedOrderStatus()) {
            filters.orderStatus = this.selectedOrderStatus();
        }
        if (this.selectedPaymentStatus()) {
            filters.paymentStatus = this.selectedPaymentStatus();
        }
        if (this.selectedPaymentMethod()) {
            filters.paymentMethod = this.selectedPaymentMethod();
        }
        if (this.orderNumberFilter().trim()) {
            filters.orderNumber = this.orderNumberFilter().trim();
        }

        this.orderService.getOrders(filters).pipe(
            takeUntil(this.destroy$),
            finalize(() => this.loading.set(false))
        ).subscribe({
            next: (res: BaseResponse<{ orders: Order[]; pagination: pagination }>) => {
                this.orders.set(res.data?.orders);
                this.pagination.set(res.data?.pagination);
            },
            error: () => this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load orders',
                life: 1000
            })
        });
    }
    loadProducts() {
        this.productService.getProductsList().pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (res: BaseResponse<IProduct[]>) => {
                this.products.set(res.data);
            },
            error: () => this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load products',
                life: 1000
            })
        });
    }

    loadPackages() {
        this.packageService.getPackagesList().pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: (res: BaseResponse<IPackage[]>) => {
                this.packages.set(res.data);
            },
            error: () => this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to load packages',
                life: 1000
            })
        });
    }
    onItemChange(event: any, index: number) {
        const itemType = this.items.at(index).get('itemType')?.value;
        const itemId = event.value;
        
        if (itemType === OrderItemType.PACKAGE) {
            const selectedPackage = this.packages().find(p => p._id === itemId);
            if (selectedPackage) {
                this.items.at(index).get('price')?.setValue(selectedPackage.price || 0);
                
                // Open package details dialog to select variants for each product
                this.openPackageDetailsDialog(selectedPackage, index);
            }
        } else {
            this.items.at(index).get('price')?.setValue(this.products().find(p => p._id === itemId)?.price || 0);
        }
        this.calculateTotal();
    }
    openNew() {
        this.orderForm.reset({
            orderStatus: OrderStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
            paymentMethod: PaymentMethod.CASH,
            subtotal: 0,
            tax: 0,
            shippingCost: 0,
            total: 0,
            items: [],
            cashPayment: {
                amountPaid: 0,
                changeDue: 0,
                paymentImage: ''
            }
        });
        this.isEditOrder = false;
        this.orderDialog = true;
    }

    editOrder(order: Order) {
        // add cashPayment to orderForm if editOrder , else remove cashPayment

        this.orderForm.patchValue({
            cashPayment: {
                amountPaid: order.cashPayment?.amountPaid || 0,
                changeDue: order.cashPayment?.changeDue || 0,
                paymentImage: order.cashPayment?.paymentImage || ''
            }
        });
        this.orderForm.patchValue({
            ...order,
            deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null
        });
        
        this.loadStates();
        // Clear existing items
        while (this.items.length) {
            this.items.removeAt(0);
        }

        // Add items from order
        if (order.items && order.items.length > 0) {
            order.items.forEach((item: OrderItem) => {
                if (item.itemType === OrderItemType.PACKAGE) {
                    // Clean package items to remove extra fields from selectedVariants
                    const cleanedPackageItems = (item.packageItems || []).map((pkgItem: any) => {
                        const cleanedVariants = (pkgItem.selectedVariants || []).map((variant: any) => {
                            const cleanedVariant: any = {
                                _id: variant._id,
                                variant: variant.variant
                            };
                            
                            // Clean the value object to only include en and ar
                            if (variant.value && typeof variant.value === 'object') {
                                cleanedVariant.value = {
                                    en: variant.value.en,
                                    ar: variant.value.ar
                                };
                            } else {
                                cleanedVariant.value = variant.value;
                            }
                            
                            // Include image if present
                            if (variant.image) {
                                cleanedVariant.image = variant.image;
                            }
                            
                            return cleanedVariant;
                        });
                        
                        return {
                            ...pkgItem,
                            selectedVariants: cleanedVariants
                        };
                    });
                    
                    // Handle package items
                    this.items.push(this.fb.group({
                        itemType: [item.itemType],
                        itemId: [item.itemId._id],
                        quantity: [item.quantity],
                        price: [item.price],
                        totalPrice: [item.totalPrice],
                        discountPrice: [item.discountPrice],
                        packageItems: [cleanedPackageItems],
                        selectedVariants: [item.selectedVariants || []]
                    }));
                } else {
                    // Clean product selectedVariants
                    const cleanedVariants = (item.selectedVariants || []).map((variant: any) => {
                        const cleanedVariant: any = {
                            _id: variant._id,
                            variant: variant.variant
                        };
                        
                        // Clean the value object to only include en and ar
                        if (variant.value && typeof variant.value === 'object') {
                            cleanedVariant.value = {
                                en: variant.value.en,
                                ar: variant.value.ar
                            };
                        } else {
                            cleanedVariant.value = variant.value;
                        }
                        
                        // Include image if present
                        if (variant.image) {
                            cleanedVariant.image = variant.image;
                        }
                        
                        return cleanedVariant;
                    });

                    this.items.push(this.fb.group({
                        itemType: [item.itemType || OrderItemType.PRODUCT],
                        itemId: [item.itemId._id],
                        quantity: [item.quantity],
                        price: [item.price],
                        totalPrice: [item.totalPrice],
                        discountPrice: [item.discountPrice],

                        packageItems: [[]],
                        selectedVariants: [cleanedVariants]
                    }));
                }
            });
        }
        this.isEditOrder = true;
        this.orderDialog = true;
    }


    deleteOrder(order: Order) {
        if (!order._id) return;

        this.confirmationService.confirm({
            message: `Are you sure you want to delete order #${order.orderNumber}?`,
            header: 'Confirm',
            icon: 'pi pi-exclamation-triangle',
            accept: () => {
                this.orderService.deleteOrder(order._id!).pipe(takeUntil(this.destroy$)).subscribe({
                    next: () => {
                        this.loadOrders();
                        this.messageService.add({
                            severity: 'success',
                            summary: 'Deleted',
                            detail: 'Order deleted successfully'
                        });
                    },
                    error: () => this.messageService.add({
                        severity: 'error',
                        summary: 'Error',
                        detail: 'Failed to delete order'
                    })
                });
            }
        });
    }

    saveOrder() {
        this.submitted = true;
        if (this.orderForm.invalid) {
            this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Please fill in all required fields',
                life: 1000
            });
            return;
        }

        const formValue = this.orderForm.value;
        
        // Clean the form data before sending
        const cleanedData = this.cleanOrderData(formValue);

        const request$ = cleanedData._id
            ? this.orderService.updateOrder(cleanedData._id, cleanedData)
            : this.orderService.createOrder(cleanedData);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: BaseResponse<any>) => {
                this.loadOrders();
                this.messageService.add({
                    severity: 'success',
                    summary: cleanedData._id ? 'Updated' : 'Created',
                    detail: `Order ${cleanedData._id ? 'updated' : 'created'} successfully`
                });
                this.hideDialog();
            },
            error: (error) => {
                console.error('Error saving order:', error);
                this.messageService.add({
                    severity: 'error',
                    summary: 'Error',
                    detail: error.error?.message || 'Failed to save order',
                    life: 1000
                });
            }
        });
    }

    private cleanOrderData(data: any): any {
        const cleanedData = { ...data };
        
        // Clean cashPayment object
        if (cleanedData.cashPayment && typeof cleanedData.cashPayment === 'object') {
            const cashPayment = cleanedData.cashPayment;
            cleanedData.cashPayment = {
                amountPaid: cashPayment.amountPaid || 0,
                changeDue: cashPayment.changeDue || 0,
                ...(cashPayment.paymentImage && { paymentImage: cashPayment.paymentImage })
            };
        }
        
        // Clean items array
        if (cleanedData.items && Array.isArray(cleanedData.items)) {
            cleanedData.items = cleanedData.items.map((item: any) => {
                const cleanedItem = { ...item };
                
                // Remove empty productId for packages
                if (cleanedItem.itemType === 'package' && (!cleanedItem.productId || cleanedItem.productId === '')) {
                    delete cleanedItem.productId;
                }
                
                // Clean packageItems
                if (cleanedItem.packageItems && Array.isArray(cleanedItem.packageItems)) {
                    cleanedItem.packageItems = cleanedItem.packageItems.map((pkgItem: any) => {
                        const cleanedPkgItem = { ...pkgItem };
                        
                        // Handle productId if it's an object
                        if (cleanedPkgItem.productId && typeof cleanedPkgItem.productId === 'object' && cleanedPkgItem.productId._id) {
                            cleanedPkgItem.productId = cleanedPkgItem.productId._id;
                        }
                        
                        // Clean and ensure _id exists for selectedVariants
                        if (cleanedPkgItem.selectedVariants && Array.isArray(cleanedPkgItem.selectedVariants)) {
                            cleanedPkgItem.selectedVariants = cleanedPkgItem.selectedVariants.map((variant: any) => {
                                const cleanedVariant: any = {
                                    _id: variant._id || new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
                                    variant: variant.variant
                                };
                                
                                // Clean the value object to only include en and ar
                                if (variant.value && typeof variant.value === 'object') {
                                    cleanedVariant.value = {
                                        en: variant.value.en,
                                        ar: variant.value.ar
                                    };
                                } else {
                                    cleanedVariant.value = variant.value;
                                }
                                
                                // Include image if present
                                if (variant.image) {
                                    cleanedVariant.image = variant.image;
                                }
                                
                                return cleanedVariant;
                            });
                        }
                        
                        // Remove _id from packageItem itself
                        const { _id, ...cleanPkgItem } = cleanedPkgItem;
                        return cleanPkgItem;
                    });
                }
                
                // Clean selectedVariants for products
                if (cleanedItem.selectedVariants && Array.isArray(cleanedItem.selectedVariants)) {
                    cleanedItem.selectedVariants = cleanedItem.selectedVariants.map((variant: any) => {
                        const cleanedVariant: any = {
                            _id: variant._id || new Date().getTime().toString() + Math.random().toString(36).substr(2, 9),
                            variant: variant.variant
                        };
                        
                        // Clean the value object to only include en and ar
                        if (variant.value && typeof variant.value === 'object') {
                            cleanedVariant.value = {
                                en: variant.value.en,
                                ar: variant.value.ar
                            };
                        } else {
                            cleanedVariant.value = variant.value;
                        }
                        
                        // Include image if present
                        if (variant.image) {
                            cleanedVariant.image = variant.image;
                        }
                        
                        return cleanedVariant;
                    });
                }
                
                // Set productId for products
                if (cleanedItem.itemType === 'product' && cleanedItem.itemId && !cleanedItem.productId) {
                    cleanedItem.productId = cleanedItem.itemId;
                }

                
                return cleanedItem;
            });
        }
        
        return cleanedData;
    }

    updateOrderStatus(order: Order, status: OrderStatus) {
        if (!order._id) return;
        this.orderService.updateOrderStatus(order._id, status).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => {
                this.loadOrders();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Updated',
                    detail: 'Order status updated successfully'
                });
            },
            error: () => this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update order status'
            })
        });
    }

    updatePaymentStatus(order: Order, status: PaymentStatus) {
        this.orderService.updatePaymentStatus(order._id!, status).pipe(
            takeUntil(this.destroy$)
        ).subscribe({
            next: () => {
                this.loadOrders();
                this.messageService.add({
                    severity: 'success',
                    summary: 'Updated',
                    detail: 'Payment status updated successfully'
                });
            },
            error: () => this.messageService.add({
                severity: 'error',
                summary: 'Error',
                detail: 'Failed to update payment status'
            })
        });
    }

    calculateTotal() {
        let subtotal = 0;
        this.items.controls.forEach(item => {
            const quantity = item.get('quantity')?.value || 0;
            const price = item.get('price')?.value || 0;
            const discount = item.get('discountPrice')?.value || 0;
            const itemTotal = (quantity * price) - (discount || 0);
            item.patchValue({ totalPrice: itemTotal }, { emitEvent: false });
            subtotal += itemTotal;
        });

        const tax = this.orderForm.get('tax')?.value || 0;
        const shippingCost = this.orderForm.get('shippingCost')?.value || 0;
        const discount = this.orderForm.get('discount')?.value || 0;

        const total = subtotal + tax + shippingCost - discount;

        this.orderForm.patchValue({
            subtotal: subtotal,
            total: total
        }, { emitEvent: false });
        
        // Recalculate change due when total changes
        if (this.isEditOrder) {
            this.calculateChangeDue();
        }
    }

    hideDialog() {
        this.orderDialog = false;
        this.submitted = false;
        this.orderForm.reset();
    }

    // Variant editing methods
    openVariantDialog(itemIndex: number): void {
        this.selectedItemIndex = itemIndex;
        const item = this.items.at(itemIndex);
        const productId = item.get('itemId')?.value;
        
        if (!productId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Please select a product first'
            });
            return;
        }

        // Get current selected variants
        this.tempSelectedVariants = [...(item.get('selectedVariants')?.value || [])];
        
        // Load available variants for the product
        this.loadAvailableVariants(productId);
        
        this.variantDialog = true;
    }

    closeVariantDialog(): void {
        this.variantDialog = false;
        this.selectedItemIndex = null;
        this.availableVariants = [];
        this.tempSelectedVariants = [];
    }

    loadAvailableVariants(productId: string): void {
        // Find the product and get its variants
        const product = this.products().find(p => p._id === productId);
        if (product && product.variants) {
            // Group attributes by variant type
            const variantGroups: { [key: string]: any[] } = {};
            
            product.variants.forEach(variant => {
                if (variant.attributes) {
                    variant.attributes.forEach(attr => {
                        const variantType = attr.variant;
                        if (!variantGroups[variantType]) {
                            variantGroups[variantType] = [];
                        }
                        // Check if this attribute is not already in the group
                        const exists = variantGroups[variantType].some(existing => 
                            existing._id === attr._id || 
                            (existing.value?.en === attr.value?.en && existing.value?.ar === attr.value?.ar)
                        );
                        if (!exists) {
                            variantGroups[variantType].push(attr);
                        }
                    });
                }
            });
            
            // Convert to array format
            this.availableVariants = Object.keys(variantGroups).map(variantType => ({
                variant: variantType,
                options: variantGroups[variantType]
            }));
        } else {
            this.availableVariants = [];
        }
    }

    getSelectedProductName(): string {
        if (this.selectedItemIndex === null) return '';
        const item = this.items.at(this.selectedItemIndex);
        const productId = item.get('itemId')?.value;
        const product = this.products().find(p => p._id === productId);
        return product?.name?.en || 'Unknown Product';
    }

    getSelectedItemName(itemId: string, itemType: string): string {
        if (!itemId) return '';
        
        if (itemType === 'package') {
            const packageItem = this.packages().find(p => p._id === itemId);
            return packageItem?.name?.en || 'Unknown Package';
        } else {
            const product = this.products().find(p => p._id === itemId);
            return product?.name?.en || 'Unknown Product';
        }
    }

    getVariantButtonLabel(item: any, rowIndex: number): string {
        const hasVariants = item.get('selectedVariants')?.value?.length > 0;
        const isEditMode = this.orderForm.get('_id')?.value;
        
        if (hasVariants) {
            return 'Edit Variants';
        } else {
            return 'Add Variants';
        }
    }

    getCurrentVariantsCount(): number {
        return this.tempSelectedVariants.length;
    }

    isVariantSelected(variant: any): boolean {
        return this.tempSelectedVariants.some(v => v.variant === variant.variant);
    }

    isVariantOptionSelected(variantType: string, option: any): boolean {
        return this.tempSelectedVariants.some(v => {
            if (v.variant !== variantType) return false;
            
            // Compare by ID first (most reliable)
            if (v._id && option._id && v._id === option._id) return true;
            
            // Compare by value
            if (v.value && option.value) {
                if (typeof v.value === 'object' && typeof option.value === 'object') {
                    return v.value.en === option.value.en && v.value.ar === option.value.ar;
                } else {
                    return v.value === option.value;
                }
            }
            
            return false;
        });
    }

    toggleVariant(variant: any, event: any): void {
        const checked = event.checked;
        if (checked) {
            // Add first option of this variant type
            if (variant.options.length > 0) {
                const firstOption = variant.options[0];
                this.tempSelectedVariants.push({
                    _id: firstOption._id,
                    variant: variant.variant,
                    value: firstOption.value,
                    image: firstOption.image
                });
            }
        } else {
            // Remove all variants of this type
            this.tempSelectedVariants = this.tempSelectedVariants.filter(v => v.variant !== variant.variant);
        }
    }

    selectVariantOption(variantType: string, option: any): void {
        // Check if this exact option is already selected
        const isAlreadySelected = this.tempSelectedVariants.some(v => {
            if (v.variant !== variantType) return false;
            
            // Compare by ID first (most reliable)
            if (v._id && option._id && v._id === option._id) return true;
            
            // Compare by value
            if (v.value && option.value) {
                if (typeof v.value === 'object' && typeof option.value === 'object') {
                    return v.value.en === option.value.en && v.value.ar === option.value.ar;
                } else {
                    return v.value === option.value;
                }
            }
            
            return false;
        });
        
        if (isAlreadySelected) {
            // If already selected, do nothing
            return;
        }
        
        // Check if there's already a variant of this type
        const existingVariantIndex = this.tempSelectedVariants.findIndex(v => v.variant === variantType);
        
        if (existingVariantIndex !== -1) {
            // Replace existing variant of this type
            this.tempSelectedVariants[existingVariantIndex] = {
                _id: option._id,
                variant: variantType,
                value: option.value,
                image: option.image
            };
        } else {
            // Add new variant
            this.tempSelectedVariants.push({
                _id: option._id,
                variant: variantType,
                value: option.value,
                image: option.image
            });
        }
    }

    removeVariant(variant: any): void {
        this.tempSelectedVariants = this.tempSelectedVariants.filter(v => 
            !(v.variant === variant.variant && 
              (v.value?.en === variant.value?.en || v.value === variant.value))
        );
    }

    getSelectedVariantsSummary(): any[] {
        return this.tempSelectedVariants;
    }

    saveVariants(): void {
        if (this.selectedItemIndex === null) return;
        
        // Ensure all variants have _id
        const variantsWithId = this.tempSelectedVariants.map(variant => ({
            ...variant,
            _id: variant._id || new Date().getTime().toString() + Math.random().toString(36).substr(2, 9)
        }));
        
        const item = this.items.at(this.selectedItemIndex);
        item.get('selectedVariants')?.setValue([...variantsWithId]);
        
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Variants updated successfully'
        });
        
        this.closeVariantDialog();
    }

    // Package variant editing methods
    openPackageVariantDialog(packageItemIndex: number, packageProductIndex: number): void {
        this.selectedPackageItemIndex = packageItemIndex;
        this.selectedPackageProductIndex = packageProductIndex;
        
        const packageItem = this.items.at(packageItemIndex);
        const packageProducts = packageItem.get('packageItems')?.value || [];
        const packageProduct = packageProducts[packageProductIndex];
        
        if (!packageProduct || !packageProduct.productId) {
            this.messageService.add({
                severity: 'warn',
                summary: 'Warning',
                detail: 'Package product not found'
            });
            return;
        }

        // Get current selected variants for this package product
        this.tempPackageVariants = [...(packageProduct.selectedVariants || [])];
        
        // Load available variants for the package product
        this.loadAvailableVariants(packageProduct.productId._id || packageProduct.productId);
        
        this.packageVariantDialog = true;
    }

    closePackageVariantDialog(): void {
        this.packageVariantDialog = false;
        this.selectedPackageItemIndex = null;
        this.selectedPackageProductIndex = null;
        this.availableVariants = [];
        this.tempPackageVariants = [];
    }

    getSelectedPackageProductName(): string {
        if (this.selectedPackageItemIndex === null || this.selectedPackageProductIndex === null) return '';
        
        const packageItem = this.items.at(this.selectedPackageItemIndex);
        const packageProducts = packageItem.get('packageItems')?.value || [];
        const packageProduct = packageProducts[this.selectedPackageProductIndex];
        
        if (packageProduct && packageProduct.productId) {
            return packageProduct.productId.name?.en || 'Unknown Product';
        }
        return 'Unknown Product';
    }

    getCurrentPackageVariantsCount(): number {
        return this.tempPackageVariants.length;
    }

    isPackageVariantSelected(variant: any): boolean {
        return this.tempPackageVariants.some(v => v.variant === variant.variant);
    }

    isPackageVariantOptionSelected(variantType: string, option: any): boolean {
        return this.tempPackageVariants.some(v => {
            if (v.variant !== variantType) return false;
            
            // Compare by ID first (most reliable)
            if (v._id && option._id && v._id === option._id) return true;
            
            // Compare by value
            if (v.value && option.value) {
                if (typeof v.value === 'object' && typeof option.value === 'object') {
                    return v.value.en === option.value.en && v.value.ar === option.value.ar;
                } else {
                    return v.value === option.value;
                }
            }
            
            return false;
        });
    }

    togglePackageVariant(variant: any, event: any): void {
        const checked = event.checked;
        if (checked) {
            // Add first option of this variant type
            if (variant.options.length > 0) {
                const firstOption = variant.options[0];
                this.tempPackageVariants.push({
                    _id: firstOption._id,
                    variant: variant.variant,
                    value: firstOption.value,
                    image: firstOption.image
                });
            }
        } else {
            // Remove all variants of this type
            this.tempPackageVariants = this.tempPackageVariants.filter(v => v.variant !== variant.variant);
        }
    }

    selectPackageVariantOption(variantType: string, option: any): void {
        // Check if this exact option is already selected
        const isAlreadySelected = this.tempPackageVariants.some(v => {
            if (v.variant !== variantType) return false;
            
            // Compare by ID first (most reliable)
            if (v._id && option._id && v._id === option._id) return true;
            
            // Compare by value
            if (v.value && option.value) {
                if (typeof v.value === 'object' && typeof option.value === 'object') {
                    return v.value.en === option.value.en && v.value.ar === option.value.ar;
                } else {
                    return v.value === option.value;
                }
            }
            
            return false;
        });
        
        if (isAlreadySelected) {
            // If already selected, do nothing
            return;
        }
        
        // Check if there's already a variant of this type
        const existingVariantIndex = this.tempPackageVariants.findIndex(v => v.variant === variantType);
        
        if (existingVariantIndex !== -1) {
            // Replace existing variant of this type
            this.tempPackageVariants[existingVariantIndex] = {
                _id: option._id,
                variant: variantType,
                value: option.value,
                image: option.image
            };
        } else {
            // Add new variant
            this.tempPackageVariants.push({
                _id: option._id,
                variant: variantType,
                value: option.value,
                image: option.image
            });
        }
    }

    removePackageVariant(variant: any): void {
        this.tempPackageVariants = this.tempPackageVariants.filter(v => 
            !(v.variant === variant.variant && 
              (v.value?.en === variant.value?.en || v.value === variant.value))
        );
    }

    getSelectedPackageVariantsSummary(): any[] {
        return this.tempPackageVariants;
    }

    savePackageVariants(): void {
        if (this.selectedPackageItemIndex === null || this.selectedPackageProductIndex === null) return;
        
        // Ensure all variants have _id
        const variantsWithId = this.tempPackageVariants.map(variant => ({
            ...variant,
            _id: variant._id || new Date().getTime().toString() + Math.random().toString(36).substr(2, 9)
        }));
        
        const packageItem = this.items.at(this.selectedPackageItemIndex);
        const packageProducts = packageItem.get('packageItems')?.value || [];
        packageProducts[this.selectedPackageProductIndex].selectedVariants = [...variantsWithId];
        packageItem.get('packageItems')?.setValue([...packageProducts]);
        
        this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Package variants updated successfully'
        });
        
        this.closePackageVariantDialog();
    }

    // Package details dialog methods
    openPackageDetailsDialog(packageData: any, itemIndex: number): void {
        this.selectedPackageForDetails = packageData;
        this.currentPackageItemIndex = itemIndex;
        
        // Initialize temp package items with default quantities
        this.tempPackageItems = packageData.items?.map((item: any) => {
            // Clean up selectedVariants to remove extra fields from value objects
            const cleanedVariants = (item.selectedVariants || []).map((variant: any) => {
                const cleanedVariant: any = {
                    _id: variant._id,
                    variant: variant.variant
                };
                
                // Clean the value object to only include en and ar
                if (variant.value && typeof variant.value === 'object') {
                    cleanedVariant.value = {
                        en: variant.value.en,
                        ar: variant.value.ar
                    };
                } else {
                    cleanedVariant.value = variant.value;
                }
                
                // Include image if present
                if (variant.image) {
                    cleanedVariant.image = variant.image;
                }
                
                return cleanedVariant;
            });
            
            return {
                productId: item.productId._id || item.productId,
                quantity: item.quantity || 1,
                selectedVariants: cleanedVariants
            };
        }) || [];
        
        // Cache variants for each product
        this.productVariantsCache = {};
        this.tempPackageItems.forEach(item => {
            this.productVariantsCache[item.productId] = this.getProductVariants(item.productId);
        });
        
        this.packageDetailsDialog = true;
    }

    closePackageDetailsDialog(): void {
        this.packageDetailsDialog = false;
        this.selectedPackageForDetails = null;
        this.tempPackageItems = [];
        this.currentPackageItemIndex = -1;
        this.expandedProductIndex = -1;
        this.productVariantsCache = {};
    }

    toggleProductVariants(productIndex: number): void {
        if (this.expandedProductIndex === productIndex) {
            this.expandedProductIndex = -1; // Collapse if already expanded
        } else {
            this.expandedProductIndex = productIndex; // Expand this product
        }
    }

    getProductVariants(productId: string): any[] {
        const product = this.products().find(p => p._id === productId);
        if (product && product.variants) {
            const variantGroups: { [key: string]: any[] } = {};
            
            product.variants.forEach(variant => {
            if (variant.attributes) {
                    variant.attributes.forEach(attr => {
                        const variantType = attr.variant;
                        if (!variantGroups[variantType]) {
                            variantGroups[variantType] = [];
                        }
                        const exists = variantGroups[variantType].some(existing => 
                            existing._id === attr._id || 
                            (existing.value?.en === attr.value?.en && existing.value?.ar === attr.value?.ar)
                        );
                        if (!exists) {
                            variantGroups[variantType].push(attr);
                    }
                });
            }
        });

            return Object.keys(variantGroups).map(variantType => ({
                variant: variantType,
                options: variantGroups[variantType]
            }));
        }
        return [];
    }

    isProductVariantSelected(productIndex: number, variantType: string, option: any): boolean {
        const product = this.tempPackageItems[productIndex];
        if (!product || !product.selectedVariants) return false;
        
        return product.selectedVariants.some((v: any) => {
            if (v.variant !== variantType) return false;
            
            if (v._id && option._id && v._id === option._id) return true;
            
            if (v.value && option.value) {
                if (typeof v.value === 'object' && typeof option.value === 'object') {
                    // Extract just the en and ar values, ignoring any extra fields like _id
                    const vValueEn = v.value.en;
                    const vValueAr = v.value.ar;
                    const optionValueEn = option.value.en;
                    const optionValueAr = option.value.ar;
                    return vValueEn === optionValueEn && vValueAr === optionValueAr;
                } else {
                    return v.value === option.value;
                }
            }
            
            return false;
        });
    }

    selectProductVariantOption(productIndex: number, variantType: string, option: any): void {
        const product = this.tempPackageItems[productIndex];
        if (!product) {
            return;
        }

        if (!product.selectedVariants) {
            product.selectedVariants = [];
        }

        // Clean the value object to remove any extra fields like _id
        const cleanValue = option.value && typeof option.value === 'object' 
            ? { en: option.value.en, ar: option.value.ar }
            : option.value;

        // Check if this exact option is already selected
        const isAlreadySelected = product.selectedVariants.some((v: any) => {
            if (v.variant !== variantType) return false;
            
            if (v._id && option._id && v._id === option._id) return true;
            
            if (v.value && option.value) {
                if (typeof v.value === 'object' && typeof option.value === 'object') {
                    const vValueEn = v.value.en;
                    const vValueAr = v.value.ar;
                    const optionValueEn = option.value.en;
                    const optionValueAr = option.value.ar;
                    return vValueEn === optionValueEn && vValueAr === optionValueAr;
                } else {
                    return v.value === option.value;
                }
            }
            
            return false;
        });
        
        if (isAlreadySelected) {
            // If already selected, remove it
            product.selectedVariants = product.selectedVariants.filter((v: any) => {
                if (v.variant !== variantType) return true;
                
                if (v._id && option._id && v._id === option._id) return false;
                
                if (v.value && option.value) {
                    if (typeof v.value === 'object' && typeof option.value === 'object') {
                        const vValueEn = v.value.en;
                        const vValueAr = v.value.ar;
                        const optionValueEn = option.value.en;
                        const optionValueAr = option.value.ar;
                        return !(vValueEn === optionValueEn && vValueAr === optionValueAr);
                    } else {
                        return v.value !== option.value;
                    }
                }
                
                return true;
            });
            // Force change detection
            this.tempPackageItems = [...this.tempPackageItems];
            return;
        }
        
        // Check if there's already a variant of this type
        const existingVariantIndex = product.selectedVariants.findIndex((v: any) => v.variant === variantType);
        
        const newVariant = {
            _id: option._id,
            variant: variantType,
            value: cleanValue,
            image: option.image
        };
        
        if (existingVariantIndex !== -1) {
            // Replace existing variant of this type
            product.selectedVariants[existingVariantIndex] = newVariant;
        } else {
            // Add new variant
            product.selectedVariants.push(newVariant);
        }
        
        // Force change detection
        this.tempPackageItems = [...this.tempPackageItems];
    }

    removeProductVariant(productIndex: number, variant: any): void {
        const product = this.tempPackageItems[productIndex];
        if (!product || !product.selectedVariants) return;

        product.selectedVariants = product.selectedVariants.filter((v: any) => 
            !(v.variant === variant.variant && 
              (v.value?.en === variant.value?.en || v.value === variant.value))
        );
    }

    saveProductVariants(): void {
        if (this.selectedPackageProductIndex !== null && this.selectedPackageProductIndex >= 0) {
            // Ensure all variants have _id
            const variantsWithId = this.tempPackageVariants.map(variant => ({
                ...variant,
                _id: variant._id || new Date().getTime().toString() + Math.random().toString(36).substr(2, 9)
            }));
            
            this.tempPackageItems[this.selectedPackageProductIndex].selectedVariants = [...variantsWithId];
            this.packageVariantDialog = false;
            this.selectedPackageProductIndex = null;
            this.tempPackageVariants = [];
        }
    }

    savePackageDetails(): void {
        if (this.currentPackageItemIndex >= 0) {
            // Update the package items in the form
            this.items.at(this.currentPackageItemIndex).get('packageItems')?.setValue([...this.tempPackageItems]);
            
            this.messageService.add({
                severity: 'success',
                summary: 'Success',
                detail: 'Package details saved successfully'
            });
            
            this.closePackageDetailsDialog();
        }
    }

    getProductName(productId: any): string {
        if (typeof productId === 'object' && productId.name) {
            return productId.name.en || productId.name.ar || 'Unknown Product';
        }
        const product = this.products().find(p => p._id === productId);
        return product?.name?.en || 'Unknown Product';
    }

    getSelectedVariantsForProduct(productIndex: number): any[] {
        const product = this.tempPackageItems[productIndex];
        if (!product || !product.selectedVariants) return [];
        
        // Filter out variants that don't have proper structure
        return product.selectedVariants.filter((variant: any) => 
            variant && 
            variant.variant && 
            variant.value && 
            (variant.value.en || variant.value.ar || variant.value)
        );
    }

    editPackageVariants(itemIndex: number): void {
        const item = this.items.at(itemIndex);
        const packageId = item.get('itemId')?.value;
        const selectedPackage = this.packages().find(p => p._id === packageId);
        
        if (selectedPackage) {
            // Get existing package items from the form
            const existingPackageItems = item.get('packageItems')?.value || [];
            
            // Create a modified package object that includes the existing selected variants
            const packageWithSelectedVariants = {
                ...selectedPackage,
                items: selectedPackage.items.map((pkgItem: any, index: number) => {
                    // Get the product ID from package item
                    const pkgProductId = pkgItem.productId._id || pkgItem.productId;
                    
                    // Find matching existing package item
                    const existingItem = existingPackageItems.find((existing: any) => {
                        const existingProductId = existing.productId?._id || existing.productId;
                        return existingProductId === pkgProductId;
                    });
                    
                    if (existingItem) {
                        return {
                            ...pkgItem,
                            quantity: existingItem.quantity || pkgItem.quantity,
                            selectedVariants: existingItem.selectedVariants || []
                        };
                    }
                    
                    return pkgItem;
                })
            };
            
            this.openPackageDetailsDialog(packageWithSelectedVariants, itemIndex);
        }
    }

    // Enhanced UI properties
    showFilters = signal(false);
    loadingExportSignal = signal(false);

    // Enhanced methods
    toggleFilters(): void {
        this.showFilters.set(!this.showFilters());
    }

    exportOrders(): void {
        this.loadingExportSignal.set(true);
        // TODO: Implement export functionality
        setTimeout(() => {
            this.loadingExportSignal.set(false);
            this.messageService.add({
                severity: 'success',
                summary: 'Export Complete',
                detail: 'Orders exported successfully'
            });
        }, 2000);
    }

    viewOrderDetails(order: any): void {
        // TODO: Implement order details view
        this.messageService.add({
            severity: 'info',
            summary: 'Order Details',
            detail: `Viewing details for order #${order.orderNumber}`
        });
    }

    // timeline feature removed

    // Math utility for template
    Math = Math;

    // Payment image methods

    onPaymentImageChange(event: any): void {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                const imageUrl = e.target.result;
                this.fileUpload = file;
                this.uploadPaymentImage();
                
            };
            reader.readAsDataURL(file);
        }
    }

    removePaymentImage(): void {
        const cashPaymentControl = this.orderForm.get('cashPayment');
        if (cashPaymentControl) {
            const currentValue = cashPaymentControl.value || {};
            cashPaymentControl.patchValue({
                ...currentValue,
                paymentImage: null
            });
        }
    }

    // Image preview methods
    previewImage(imageUrl: string, title: string = 'Image Preview'): void {
        this.previewImageUrl = imageUrl;
        this.previewImageTitle = title;
        this.imagePreviewDialog = true;
    }

    closeImagePreview(): void {
        this.imagePreviewDialog = false;
        this.previewImageUrl = '';
        this.previewImageTitle = '';
    }

    getPaymentImageUrl(): string | null {
        const cashPayment = this.orderForm.get('cashPayment')?.value;
        return cashPayment?.paymentImage ? `${environment.baseUrl}/${cashPayment.paymentImage}` : null;
    }

    fileUpload:any
    uploadPaymentImage(): void {

    this._uploadFilesService.PostImageFile({ file: this.fileUpload, folderName: 'Uploads' }).subscribe({
        next: (event: HttpEvent<BaseResponse<Archived>>) => {
          if (event.type === HttpEventType.UploadProgress) {
            if (event.total) {
              const progress = Math.round(100 * event.loaded / event.total);
            }
          } else if (event instanceof HttpResponse) {
            // this.updateFileState(fileObj.id, {
            //   uploading: false,
            //   uploaded: true,
            //   progress: 100
            // });
  
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: `${this.fileUpload.name} uploaded successfully`
            });
  
            const responseData = event.body?.data;
            if (responseData) {
                this.cashPayment.patchValue({
                    paymentImage: responseData.filePath
                });
              // this.files.push({ file: fileObj, Result: responseData });
              // this.updateFormControl();
            } else {
              // this.updateFileState(fileObj.id, {
              //   uploading: false,
              //   error: 'No response data received from server',
              //   progress: 0
              // });
            }
          }
        },
        error: (error) => {
          const errorMessage = error.error?.message || error.message || 'Upload failed';
          // this.updateFileState(fileObj.id, {
          //   uploading: false,
          //   error: errorMessage,
          //   progress: 0
          // });
  
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: `Failed to upload ${this.fileUpload.name}`
          });
        }
      });
    }

    downloadImage(): void {
        if (this.previewImageUrl) {
            const link = document.createElement('a');
            link.href = this.previewImageUrl;
            link.download = `payment-image-${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    onPageChange(event: any) {
        const page = event.first / event.rows + 1;
        const limit = event.rows;
        this.pagination.set({
            ...this.pagination(),
            page: page,
            limit: limit
        });
        this.loadOrders();
    }

}
