export interface RevenueStatistics {
  today: {
    revenue: number;
    change: number;
    changePercent: number;
  };
  month: {
    revenue: number;
    change: number;
    changePercent: number;
  };
  year: {
    revenue: number;
    change: number;
    changePercent: number;
  };
}

export interface TopProduct {
  productId: string;
  name: { en: string; ar: string };
  price: number;
  soldCount: number;
  totalRevenue: number;
  totalQuantity: number;
  images: any[];
}

export interface TopPackage {
  packageId: string;
  name: { en: string; ar: string };
  price: number;
  soldCount: number;
  totalRevenue: number;
  totalQuantity: number;
  images: any[];
}

export interface CustomerStatistics {
  _id: string;
  phone: string;
  fullName?: string;
  orderCount: number;
  totalAmount: number;
  state?: {
    _id: string;
    name: { en: string; ar: string };
  };
  country?: {
    _id: string;
    name: { en: string; ar: string };
  };
  city?: string;
  address?: string;
  lastOrderDate?: Date;
  firstOrderDate?: Date;
}

export interface TopState {
  stateId: string;
  stateName: { en: string; ar: string };
  totalRevenue: number;
  orderCount: number;
}

export interface OrderCountStatistics {
  today: number;
  month: number;
  year: number;
  pending: number;
  paid: number;
}

export interface AverageOrderValue {
  averageOrderValue: number;
  minOrderValue: number;
  maxOrderValue: number;
}

export interface SalesTrend {
  date: string;
  revenue: number;
  orderCount: number;
}

export interface PaymentMethodStatistics {
  paymentMethod: string;
  count: number;
  totalRevenue: number;
}

export interface DashboardStatistics {
  revenue: RevenueStatistics;
  orderCount: OrderCountStatistics;
  averageOrderValue: AverageOrderValue;
  salesTrend: SalesTrend[];
  paymentMethods: PaymentMethodStatistics[];
  topProducts: TopProduct[];
  topPackages: TopPackage[];
  topCustomersByOrders: CustomerStatistics[];
  topCustomersByAmount: CustomerStatistics[];
  topStates: TopState[];
  totals: {
    customers: number;
    orders: number;
    products: number;
    packages: number;
  };
}

