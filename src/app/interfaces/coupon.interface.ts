export enum CouponType {
  PERCENTAGE = 'percentage',
  FIXED_AMOUNT = 'fixed_amount',
}

export interface Coupon {
  id?: string;
  code: string;
  description?: string;
  type: CouponType;
  value: number;
  minimumOrderAmount?: number;
  maximumDiscountAmount?: number;
  usageLimit: number;
  usedCount: number;
  expiryDate: Date;
  startDate?: Date;
  isActive: boolean;
  applicableCategories: string[];
  applicableProducts: string[];
  usedByUsers: string[];
}
