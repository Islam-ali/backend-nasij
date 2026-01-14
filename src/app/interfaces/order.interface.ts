import { IPackage } from "./package.interface";
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
    DEBIT_CARD = 'debit_card',
    BANK_TRANSFER = 'bank_transfer',
    PAYPAL = 'paypal',
    STRIPE = 'stripe',
    WALLET = 'wallet',
    VODAFONE_CASH = 'vodafone_cash',
    PAYMOB = 'paymob'
}

export enum OrderItemType {
    PRODUCT = 'Product',
    PACKAGE = 'Package'
}

export interface PackageItem {
    productId: string;
    quantity: number;
    selectedVariants: ProductVariantAttribute[];
}

export interface ProductVariantAttribute {
    _id: string;
    variant: string;
    value: {
        en: string;
        ar: string;
    };
    image?: {
        url: string;
        publicId: string;
    };
}

export interface OrderItem {
    itemType: OrderItemType;
    itemId:  IProduct | IPackage;
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
    paymentImage?: string;
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
    isDeposit?: boolean;
    paymentImage?: string;
    notes?: string;
    deliveredAt?: Date;
}
