import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IProduct } from '../interfaces/product.interface';

export interface StockMovement {
  id: string;
  productId: IProduct;
  movementType: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  previousStock: number;
  newStock: number;
  movementDate: Date;
  reason: string;
  orderId?: string;
  notes?: string;
}

export interface Expense {
  id: string;
  _id?: string; // For compatibility
  title: string;
  description?: string;
  amount: number;
  category: string;
  paymentMethod: string;
  expenseDate: Date;
  receiptNumber?: string;
  vendor?: string;
  isRecurring: boolean;
  recurringPeriod?: string;
  nextDueDate?: Date;
  status: string; // PENDING, APPROVED, REJECTED, PAID
  notes?: string;
}

export interface Revenue {
  id: string;
  _id?: string; // For compatibility
  title: string;
  description?: string;
  amount: number;
  category: string;
  paymentMethod: string;
  revenueDate: Date;
  orderNumber?: string;
  orderId?: string;
  notes?: string;
}

export interface ProfitReport {
  id: string;
  period: string;
  startDate: Date;
  endDate: Date;
  totalRevenue: number;
  totalCostOfGoodsSold: number;
  totalExpenses: number;
  grossProfit: number;
  netProfit: number;
  profitMargin: number;
  totalOrders: number;
  totalItemsSold: number;
  averageOrderValue: number;
  topSellingProducts: TopSellingProduct[];
  expensesByCategory: any[];
  isCalculated: boolean;
  calculatedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashFlowReport {
  cashFlow: CashFlowItem[];
  summary: {
    totalInflows: number;
    totalOutflows: number;
    netCashFlow: number;
  };
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface CashFlowItem {
  date: Date;
  amount: number;
  type: 'INFLOW' | 'OUTFLOW';
  description: string;
  category: string;
}

export interface TopSellingProduct {
  productId: string;
  productName: string;
  quantitySold: number;
  revenue: number;
  cost: number;
  profit: number;
}

export interface DashboardSummary {
  monthlyProfit: {
    revenue: number;
    expenses: number;
    netProfit: number;
    profitMargin: number;
  };
  lowStockProducts: number;
  topSellingProducts: TopSellingProduct[];
}

export interface StockLevel {
  factoryPrice: number;
  name: string;
  price: number;
  stock: number;
  _id: string;
}

export interface BaseResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  timestamp: string;
  statusCode: number;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {

  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) { }

  // Stock Movements
  getStockMovements(params?: any): Observable<BaseResponse<{ movements: StockMovement[]; pagination: any }>> {
    const cleanParams = this.cleanQueryParams(params);
    return this.http.get<BaseResponse<{ movements: StockMovement[]; pagination: any }>>(`${this.apiUrl}/stock-movements`, { params: cleanParams });
  }

  createStockMovement(movement: any): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/stock-movements`, movement);
  }

  // Expenses
  getExpenses(params?: any): Observable<BaseResponse<{ expenses: Expense[]; pagination: any }>> {
    const cleanParams = this.cleanQueryParams(params);
    return this.http.get<BaseResponse<{ expenses: Expense[]; pagination: any }>>(`${this.apiUrl}/expenses`, { params: cleanParams });
  }

  createExpense(expense: any): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense);
  }

  updateExpense(id: string, expense: any): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/expenses/${id}`, expense);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
  }

  // Revenues
  getRevenues(params?: any): Observable<BaseResponse<{ revenues: Revenue[]; pagination: any }>> {
    const cleanParams = this.cleanQueryParams(params);
    return this.http.get<BaseResponse<{ revenues: Revenue[]; pagination: any }>>(`${this.apiUrl}/revenues`, { params: cleanParams });
  }

  recalculateRevenue(): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/recalculate-revenue`, {});
  }

  // Profit Reports
  generateProfitReport(params: any): Observable<BaseResponse<ProfitReport>> {
    return this.http.post<BaseResponse<ProfitReport>>(`${this.apiUrl}/reports/profit`, params);
  }

  recalculateProfitReport(params: any): Observable<ProfitReport> {
    return this.http.post<ProfitReport>(`${this.apiUrl}/recalculate-profit-report`, params);
  }

  clearProfitReports(): Observable<BaseResponse<{ deletedCount: number }>> {
    return this.http.delete<BaseResponse<{ deletedCount: number }>>(`${this.apiUrl}/clear-profit-reports`);
  }

  getProfitReports(period?: string, limit?: number): Observable<ProfitReport[]> {
    const params: any = {};
    if (period) params.period = period;
    if (limit) params.limit = limit;
    return this.http.get<ProfitReport[]>(`${this.apiUrl}/reports/profit`, { params });
  }

  // Cash Flow
  getCashFlow(params: any): Observable<BaseResponse<CashFlowReport>> {
    const cleanParams = this.cleanQueryParams(params);
    return this.http.get<BaseResponse<CashFlowReport>>(`${this.apiUrl}/reports/cash-flow`, { params: cleanParams });
  }

  // Stock Levels
  getCurrentStockLevels(): Observable<BaseResponse<StockLevel[]>> {
    return this.http.get<BaseResponse<StockLevel[]>>(`${this.apiUrl}/stock/current-levels`);
  }

  getLowStockAlerts(threshold: number = 10): Observable<BaseResponse<StockLevel[]>> {
    return this.http.get<BaseResponse<StockLevel[]>>(`${this.apiUrl}/stock/low-stock-alerts`, { 
      params: { threshold: threshold.toString() } 
    });
  }

  // Top Selling Products
  getTopSellingProducts(params: any): Observable<BaseResponse<TopSellingProduct[]>> {
    const cleanParams = this.cleanQueryParams(params);
    return this.http.get<BaseResponse<TopSellingProduct[]>>(`${this.apiUrl}/reports/top-selling-products`, { params: cleanParams });
  }

  // Dashboard
  getDashboardSummary(): Observable<BaseResponse<DashboardSummary>> {
    return this.http.get<BaseResponse<DashboardSummary>>(`${this.apiUrl}/dashboard/summary`);
  }

  // Quick Actions
  quickAddStock(data: { productId: string; quantity: number; unitCost: number }): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/quick/add-stock`, data);
  }

  quickAdjustStock(data: { productId: string; newStock: number; reason: string }): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/quick/adjust-stock`, data);
  }

  // Record sale (called automatically when order is created)
  recordSale(orderId: string, items: any[]): Observable<any> {
    return this.http.post(`${this.apiUrl}/record-sale`, { orderId, items });
  }

  // Record accounting transaction
  recordAccountingTransaction(orderId: string, orderData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/record-accounting-transaction`, { orderId, orderData });
  }

  // Helper method to clean query parameters
  private cleanQueryParams(params: any): any {
    if (!params) return {};
    
    const cleanParams: any = {};
    
    Object.keys(params).forEach(key => {
      const value = params[key];
      
      // تجاهل القيم undefined, null, أو النصوص الفارغة
      if (value !== undefined && value !== null && value !== '') {
        // إذا كانت القيمة نص، تأكد من أنها ليست فارغة بعد إزالة المسافات
        if (typeof value === 'string' && value.trim() !== '') {
          cleanParams[key] = value.trim();
        } else if (typeof value !== 'string') {
          cleanParams[key] = value;
        }
      }
    });
    
    return cleanParams;
  }
} 