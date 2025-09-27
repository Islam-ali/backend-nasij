export enum OrderTrackingStatus {
  RECEIVED = 'received',
  CONFIRMED = 'confirmed',
  PROCESSING = 'processing',
  PREPARING = 'preparing',
  READY_FOR_PICKUP = 'ready_for_pickup',
  SHIPPED = 'shipped',
  OUT_FOR_DELIVERY = 'out_for_delivery',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
  RETURNED = 'returned',
  REFUNDED = 'refunded'
}

export enum OrderTrackingIcon {
  RECEIVED = '📥',
  CONFIRMED = '✅',
  PROCESSING = '⚙️',
  PREPARING = '👨‍🍳',
  READY_FOR_PICKUP = '📦',
  SHIPPED = '🚚',
  OUT_FOR_DELIVERY = '🚛',
  DELIVERED = '🎉',
  CANCELLED = '❌',
  RETURNED = '↩️',
  REFUNDED = '💰'
}

export interface OrderTimelineEvent {
  id: string;
  orderId: string;
  status: OrderTrackingStatus;
  icon: OrderTrackingIcon;
  dateTime: Date;
  note?: string;
  statusLabel: {
    en: string;
    ar: string;
  };
  createdAt: Date;
  updatedAt: Date;
  isDone: boolean;
}

export interface OrderTimelineResponse {
  orderId: string;
  events: OrderTimelineEvent[];
  currentStatus: OrderTrackingStatus;
}

export interface AddTimelineEventRequest {
  status: OrderTrackingStatus;
  note?: string;
}

export interface StatusDisplayInfo {
  icon: string;
  label: {
    en: string;
    ar: string;
  };
  color: string;
}

export const OrderTrackingStatusLabels = {
  [OrderTrackingStatus.RECEIVED]: {
    en: 'Received',
    ar: 'تم الاستلام'
  },
  [OrderTrackingStatus.CONFIRMED]: {
    en: 'Confirmed',
    ar: 'تم التأكيد'
  },
  [OrderTrackingStatus.PROCESSING]: {
    en: 'Processing',
    ar: 'قيد المعالجة'
  },
  [OrderTrackingStatus.PREPARING]: {
    en: 'Preparing',
    ar: 'قيد التحضير'
  },
  [OrderTrackingStatus.READY_FOR_PICKUP]: {
    en: 'Ready for Pickup',
    ar: 'جاهز للاستلام'
  },
  [OrderTrackingStatus.SHIPPED]: {
    en: 'Shipped',
    ar: 'تم الشحن'
  },
  [OrderTrackingStatus.OUT_FOR_DELIVERY]: {
    en: 'Out for Delivery',
    ar: 'خارج للتوصيل'
  },
  [OrderTrackingStatus.DELIVERED]: {
    en: 'Delivered',
    ar: 'تم التوصيل'
  },
  [OrderTrackingStatus.CANCELLED]: {
    en: 'Cancelled',
    ar: 'تم الإلغاء'
  },
  [OrderTrackingStatus.RETURNED]: {
    en: 'Returned',
    ar: 'تم الإرجاع'
  },
  [OrderTrackingStatus.REFUNDED]: {
    en: 'Refunded',
    ar: 'تم الاسترداد'
  }
};

export const OrderTrackingStatusColors = {
  [OrderTrackingStatus.RECEIVED]: 'info',
  [OrderTrackingStatus.CONFIRMED]: 'success',
  [OrderTrackingStatus.PROCESSING]: 'warning',
  [OrderTrackingStatus.PREPARING]: 'warning',
  [OrderTrackingStatus.READY_FOR_PICKUP]: 'help',
  [OrderTrackingStatus.SHIPPED]: 'secondary',
  [OrderTrackingStatus.OUT_FOR_DELIVERY]: 'help',
  [OrderTrackingStatus.DELIVERED]: 'success',
  [OrderTrackingStatus.CANCELLED]: 'danger',
  [OrderTrackingStatus.RETURNED]: 'warning',
  [OrderTrackingStatus.REFUNDED]: 'info'
};