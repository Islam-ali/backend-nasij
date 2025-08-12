import { IProduct } from "./product.interface";

export enum OrderStatus {
    PENDING = 'pending',
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
    RETURNED = 'returned'
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

export interface OrderItem {
    productId: IProduct;
    quantity: number;
    price: number;
    discountPrice?: number;
    color?: string;
    size?: string;
    totalPrice: number;
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
