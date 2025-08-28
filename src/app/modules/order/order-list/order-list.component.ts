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

import { Order, OrderStatus, PaymentMethod, PaymentStatus, OrderItem } from '../../../interfaces/order.interface';
import { OrderService } from '../../../services/order.service';
import { BaseResponse, pagination } from '../../../core/models/baseResponse';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { TextareaModule } from 'primeng/textarea';
import { ProductsService } from '../../../services/products.service';
import { IProduct, ProductVariant, ProductVariantAttribute } from '../../../interfaces/product.interface';
import { EnumProductVariant } from '../../product/product-list/product-list.component';

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
        FormsModule
    ],
    providers: [MessageService, ConfirmationService, OrderService]
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

    statusOptions = [
        { label: 'Pending', value: OrderStatus.PENDING },
        { label: 'Processing', value: OrderStatus.PROCESSING },
        { label: 'Shipped', value: OrderStatus.SHIPPED },
        { label: 'Delivered', value: OrderStatus.DELIVERED },
        { label: 'Cancelled', value: OrderStatus.CANCELLED }
    ];

    paymentStatusOptions = [
        { label: 'Pending', value: PaymentStatus.PENDING },
        { label: 'Paid', value: PaymentStatus.PAID },
        { label: 'Failed', value: PaymentStatus.FAILED },
        { label: 'Refunded', value: PaymentStatus.REFUNDED }
    ];

    paymentMethodOptions = [
        { label: 'Cash', value: PaymentMethod.CASH },
        { label: 'Credit Card', value: PaymentMethod.CREDIT_CARD },
        { label: 'PayPal', value: PaymentMethod.PAYPAL },
        { label: 'Stripe', value: PaymentMethod.STRIPE }
    ];

    countryOptions = [
        { label: 'Egypt', value: 'EG' }
    ];

    stateOptions = [
        { label: 'Cairo', value: 'Cairo' },
        { label: 'Giza', value: 'Giza' },
        { label: 'Alexandria', value: 'Alexandria' },
        { label: 'Mansoura', value: 'Mansoura' },
        { label: 'Suez', value: 'Suez' },
        { label: 'Luxor', value: 'Luxor' },
        { label: 'Aswan', value: 'Aswan' },
        { label: 'Asyut', value: 'Asyut' },
        { label: 'Beheira', value: 'Beheira' },
        { label: 'Beni Suef', value: 'Beni Suef' },
        { label: 'Faiyum', value: 'Faiyum' },
        { label: 'Gharbia', value: 'Gharbia' },
        { label: 'Ismailia', value: 'Ismailia' },
        { label: 'Kafr El Sheikh', value: 'Kafr El Sheikh' },
        { label: 'Minya', value: 'Minya' },
        { label: 'Monufia', value: 'Monufia' },
        { label: 'New Valley', value: 'New Valley' },
        { label: 'North Sinai', value: 'North Sinai' },
        { label: 'Port Said', value: 'Port Said' },
        { label: 'Qalyubia', value: 'Qalyubia' },
        { label: 'Qena', value: 'Qena' },
        { label: 'Red Sea', value: 'Red Sea' },
        { label: 'Sharqia', value: 'Sharqia' },
        { label: 'Sohag', value: 'Sohag' },
        { label: 'South Sinai', value: 'South Sinai' },
        { label: 'Suez', value: 'Suez' },
        { label: 'Tanta', value: 'Tanta' },
        { label: 'Wadi El Nile', value: 'Wadi El Nile' },
        { label: 'West Bank', value: 'West Bank' },
    ];

    @ViewChild('dt') dt: Table | undefined;
    exportColumns!: ExportColumn[];
    cols!: Column[];
    products = signal<IProduct[]>([]);
    constructor(
        private fb: FormBuilder,
        private orderService: OrderService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private productService: ProductsService
    ) {
        super();
    }

    ngOnInit() {
        this.buildForm();
        this.loadOrders();
        this.loadProducts();
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

    // add cashPayment to orderForm if editOrder , else remove cashPayment
    buildForm() {
        this.orderForm = this.fb.group({
            _id: [null],
            items: this.fb.array([], Validators.required),
            subtotal: [0, [Validators.required, Validators.min(0)]],
            tax: [0, [Validators.required, Validators.min(0)]],
            shippingCost: [0],
            total: [0, [Validators.required, Validators.min(0.01)]],
            // cashPayment: this.fb.group({
            //     amountPaid: [0, [Validators.required, Validators.min(0)]],
            //     changeDue: [0]
            // }),
            orderStatus: [OrderStatus.PENDING, Validators.required],
            paymentStatus: [PaymentStatus.PENDING, Validators.required],
            paymentMethod: [PaymentMethod.CASH, Validators.required],
            shippingAddress: this.fb.group({
                fullName: ['', Validators.required],
                phone: ['', Validators.required],
                address: ['', Validators.required],
                city: ['', Validators.required],
                // state: ['', Validators.required],
                // zipCode: [''],
                country: ['EG', Validators.required]
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
            productId: ['', Validators.required],
            quantity: [1, [Validators.required, Validators.min(1)]],
            price: [0, [Validators.required, Validators.min(0)]],
            totalPrice: [0, [Validators.required, Validators.min(0)]],
            discountPrice: [0, [Validators.min(0)]],
            color: ['', Validators.required],
            size: ['', Validators.required],
            listColors: [[]],
            listSizes: [[]]
        });
        this.items.push(itemGroup);
        this.calculateTotal();
    }

    removeItem(index: number): void {
        this.items.removeAt(index);
        this.calculateTotal();
    }


    colors(colors: string[], index: number) {
        console.log(colors, index);
        colors.map(color => ({ name: color, value: color }));
        this.items.at(index).get('listColors')?.setValue(colors);
    }
    sizes(sizes: string[], index: number) {
        console.log(sizes, index);
        sizes.map(size => ({ name: size, value: size }));
        this.items.at(index).get('listSizes')?.setValue(sizes);
    }
    onColorChange(event: any, index: number): void {
        const item = this.items.at(index);
        if (item) {
            item.patchValue({
                color: event.value,
            });
        }
    }
    onSizeChange(event: any, index: number): void {
        const item = this.items.at(index);
        if (item) {
            item.patchValue({
                size: event.value,
            });
        }
    }
    getSeverity(status: OrderStatus) {
        switch (status) {
            case OrderStatus.DELIVERED:
                return 'success';
            case OrderStatus.PROCESSING:
                return 'info';
            case OrderStatus.SHIPPED:
                return 'info';
            case OrderStatus.PENDING:
                return 'warn';
            case OrderStatus.CANCELLED:
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

    onGlobalFilter(dt: Table, event: any): void {
        dt.filterGlobal((event.target as HTMLInputElement).value, 'contains');
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

    loadOrders(page: number = 0, limit: number = 10) {
        this.loading.set(true);
        this.orderService.getOrders({
            limit: limit,
            page: page + 1
        }).pipe(
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
            shippingAddress: {
                country: 'EG'
            }
        });
        this.isEditOrder = false;
        this.orderDialog = true;
    }

    editOrder(order: Order) {
        // add cashPayment to orderForm if editOrder , else remove cashPayment

        this.orderForm.addControl('cashPayment', this.fb.group({
            amountPaid: [0, [Validators.required, Validators.min(0)]],
            changeDue: [0]
        }));

        this.orderForm.patchValue({
            ...order,
            deliveredAt: order.deliveredAt ? new Date(order.deliveredAt) : null
        });

        // Clear existing items
        while (this.items.length) {
            this.items.removeAt(0);
        }

        // Add items from order
        if (order.items && order.items.length > 0) {
            order.items.forEach((item: OrderItem) => {
                // Use variantName or generate a name based on productId
                // Calculate total based on quantity and price
                // const itemTotal = (item.quantity || 0) * (item.price || 0);
                const { colors, sizes } = this.extractColorsAndSizes(item.productId);
                console.log(item.productId._id, 'item.productId');

                this.items.push(this.fb.group({
                    productId: [item.productId._id],
                    quantity: [item.quantity],
                    price: [item.price],
                    totalPrice: [item.totalPrice],
                    discountPrice: [item.discountPrice],
                    color: [item.color],
                    size: [item.size],
                    listColors: [colors],
                    listSizes: [sizes]
                }));
            });
        }
        console.log(this.orderForm.value, 'orderForm', order);
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
        formValue.items.forEach((item: any) => {
            delete item.listColors;
            delete item.listSizes;
        });
        const request$ = formValue._id
            ? this.orderService.updateOrder(formValue._id, formValue)
            : this.orderService.createOrder(formValue);

        request$.pipe(takeUntil(this.destroy$)).subscribe({
            next: (res: BaseResponse<any>) => {
                this.loadOrders();
                this.messageService.add({
                    severity: 'success',
                    summary: formValue._id ? 'Updated' : 'Created',
                    detail: `Order ${formValue._id ? 'updated' : 'created'} successfully`
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

    onProductChange(event: any, index: number) {
        const product: IProduct | undefined = this.products().find(p => p._id === event.value);
        if (product) {
            console.log(product, index);
            this.items.controls[index].get('price')?.setValue(product.price);
            this.calculateTotal();
            const { colors, sizes } = this.extractColorsAndSizes(product);
            this.colors(colors, index)
            this.sizes(sizes, index)
            console.log(colors, sizes);
        }
    }

    private extractColorsAndSizes(product: IProduct): { colors: string[], sizes: string[] } {
        if (!product || !product.variants) return { colors: [], sizes: [] };

        const colors = new Set<string>();
        const sizes = new Set<string>();
        product.variants.forEach((variant: ProductVariant) => {
            if (variant.attributes) {
                variant.attributes.forEach((attr: ProductVariantAttribute) => {
                    if (attr.variant === EnumProductVariant.COLOR) {
                        colors.add(attr.value);
                    } else if (attr.variant === EnumProductVariant.SIZE) {
                        sizes.add(attr.value);
                    }
                });
            }
        });

        product.colors = Array.from(colors);
        product.sizes = Array.from(sizes);
        return { colors: product.colors, sizes: product.sizes };
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
    }

    hideDialog() {
        this.orderDialog = false;
        this.submitted = false;
        this.orderForm.reset();
    }

    onPageChange(event: any) {
        const page = event.first / event.rows + 1;
        const limit = event.rows;
        this.loadOrders(page, limit);
    }
}
