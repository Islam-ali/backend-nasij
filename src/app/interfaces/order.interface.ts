import { IProduct } from "./product.interface";

export enum OrderStatus {
    PENDING = 'pending',
    CONFIRMED = 'confirmed',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    POSTPONED = 'postponed',
    RETURNED = 'returned',
  }
  

export enum PaymentStatus {
    PENDING = 'pending',
    PAID = 'paid',
    FAILED = 'failed',
    REFUNDED = 'refunded'
}

export enum PaymentMethod {
    CASH = 'cash',
    CREDIT_CARD = 'credit_card',
    PAYPAL = 'paypal',
    STRIPE = 'stripe'
}

export enum OrderItemType {
    PRODUCT = 'product',
    PACKAGE = 'package'
}

export interface PackageItem {
    productId: string;
    quantity: number;
    selectedVariants: ProductVariantAttribute[];
}

export interface ProductVariantAttribute {
    variant: string;
    value: string;
}

export interface OrderItem {
    itemType: OrderItemType;
    itemId: string;
    productId?: IProduct; // Legacy field for backward compatibility
    quantity: number;
    price?: number;
    discountPrice?: number;
    color?: string;
    size?: string;
    totalPrice?: number;
    packageItems?: PackageItem[];
    selectedVariants?: ProductVariantAttribute[];
}

export interface ShippingAddress {
    fullName: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    phone?: string;
}

export interface CashPayment {
    amountPaid?: number;
    changeDue?: number;
}

export interface Order {
    _id: string;
    user: string;
    items: OrderItem[];
    subtotal: number;
    tax: number;
    shippingCost: number;
    discount: number;
    total: number;
    paymentStatus: PaymentStatus;
    orderStatus: OrderStatus;
    orderNumber: string;
    shippingAddress: ShippingAddress;
    coupon?: string;
    cashPayment?: CashPayment;
    paymentMethod: PaymentMethod;
    notes?: string;
    deliveredAt?: Date;
}
