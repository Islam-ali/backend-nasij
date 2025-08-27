import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../core/models/baseResponse';
import { Product } from '../pages/service/product.service';

// Interfaces
export interface StockMovement {
  _id?: string;
  productId: Product;
  movementType: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE' | 'RETURN' | 'DAMAGED' | 'EXPIRED';
  reason: 'PURCHASE' | 'SALE' | 'RETURN' | 'ADJUSTMENT' | 'DAMAGED' | 'EXPIRED' | 'TRANSFER' | 'INITIAL_STOCK';
  quantity: number;
  unitCost: number;
  totalCost: number;
  previousStock: number;
  newStock: number;
  orderId?: string;
  reference?: string;
  notes?: string;
  movementDate: Date;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Expense {
  _id?: string;
  title: string;
  description?: string;
  amount: number;
  category: 'RENT' | 'UTILITIES' | 'SALARY' | 'MARKETING' | 'INVENTORY' | 'SHIPPING' | 'MAINTENANCE' | 'INSURANCE' | 'TAXES' | 'OFFICE_SUPPLIES' | 'TRAVEL' | 'PROFESSIONAL_SERVICES' | 'OTHER';
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CREDIT_CARD' | 'CHECK' | 'DIGITAL_PAYMENT';
  expenseDate: Date;
  receiptNumber?: string;
  vendor?: string;
  isRecurring: boolean;
  recurringPeriod?: string;
  nextDueDate?: Date;
  isApproved: boolean;
  approvedBy?: string;
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProfitReport {
  _id?: string;
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
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
  topSellingProducts: Array<{
    productId: string;
    productName: string;
    quantitySold: number;
    revenue: number;
    cost: number;
    profit: number;
  }>;
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number;
  }>;
  isCalculated: boolean;
  calculatedAt?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CashFlowItem {
  date: Date;
  amount: number;
  type: 'INFLOW' | 'OUTFLOW';
  description: string;
  category: string;
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
  _id: string;
  name: string;
  stock: number;
  price: number;
  factoryPrice?: number;
}

// Query interfaces
export interface StockMovementQuery {
  productId?: string;
  movementType?: string;
  reason?: string;
  startDate?: Date;
  endDate?: Date;
  page?: number;
  limit?: number;
}

export interface ExpenseQuery {
  category?: string;
  paymentMethod?: string;
  startDate?: Date;
  endDate?: Date;
  isRecurring?: boolean;
  isApproved?: boolean;
  page?: number;
  limit?: number;
}

export interface ProfitReportQuery {
  period: string;
  startDate: Date;
  endDate: Date;
  recalculate?: boolean;
}

export interface CashFlowQuery {
  startDate: Date;
  endDate: Date;
  page?: number;
  limit?: number;
}

export interface TopSellingProductsQuery {
  startDate: Date;
  endDate: Date;
  limit?: number;
  categoryId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class InventoryService {
  private apiUrl = `${environment.apiUrl}/inventory`;

  constructor(private http: HttpClient) {}

  // Stock Movement Methods
  createStockMovement(movement: Partial<StockMovement>): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/stock-movements`, movement);
  }

  getStockMovements(query: StockMovementQuery = {}): Observable<BaseResponse<{ movements: StockMovement[]; pagination: any }>> {
    let params = new HttpParams();
    
    if (query.productId) params = params.set('productId', query.productId);
    if (query.movementType) params = params.set('movementType', query.movementType);
    if (query.reason) params = params.set('reason', query.reason);
    if (query.startDate) params = params.set('startDate', query.startDate.toString());
    if (query.endDate) params = params.set('endDate', query.endDate.toString());
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());

    return this.http.get<BaseResponse<{ movements: StockMovement[]; pagination: any }>>(`${this.apiUrl}/stock-movements`, { params });
  }

  getStockMovementById(id: string): Observable<StockMovement> {
    return this.http.get<StockMovement>(`${this.apiUrl}/stock-movements/${id}`);
  }

  updateStockMovement(id: string, update: Partial<StockMovement>): Observable<StockMovement> {
    return this.http.put<StockMovement>(`${this.apiUrl}/stock-movements/${id}`, update);
  }

  // Expense Methods
  createExpense(expense: Partial<Expense>): Observable<Expense> {
    return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense);
  }

  getExpenses(query: ExpenseQuery = {}): Observable<BaseResponse<{ expenses: Expense[]; pagination: any }>> {
    let params = new HttpParams();
    
    if (query.category) params = params.set('category', query.category);
    if (query.paymentMethod) params = params.set('paymentMethod', query.paymentMethod);
    if (query.isRecurring !== undefined) params = params.set('isRecurring', query.isRecurring.toString());
    if (query.isApproved !== undefined) params = params.set('isApproved', query.isApproved.toString());
    if (query.startDate) params = params.set('startDate', query.startDate.toString());
    if (query.endDate) params = params.set('endDate', query.endDate.toString());
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());

    return this.http.get<BaseResponse<{ expenses: Expense[]; pagination: any }>>(`${this.apiUrl}/expenses`, { params });
  }

  getExpenseById(id: string): Observable<Expense> {
    return this.http.get<Expense>(`${this.apiUrl}/expenses/${id}`);
  }

  updateExpense(id: string, update: Partial<Expense>): Observable<Expense> {
    return this.http.put<Expense>(`${this.apiUrl}/expenses/${id}`, update);
  }

  deleteExpense(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
  }

  // Report Methods
  generateProfitReport(query: ProfitReportQuery): Observable<ProfitReport> {
    return this.http.post<ProfitReport>(`${this.apiUrl}/reports/profit`, query);
  }

  getProfitReports(period?: string, limit?: number): Observable<ProfitReport[]> {
    let params = new HttpParams();
    if (period) params = params.set('period', period);
    if (limit) params = params.set('limit', limit.toString());
    
    return this.http.get<ProfitReport[]>(`${this.apiUrl}/reports/profit`, { params });
  }

  getCashFlow(query: CashFlowQuery): Observable<BaseResponse<CashFlowReport>> {
    let params = new HttpParams();
    params = params.set('startDate', query.startDate.toString());
    params = params.set('endDate', query.endDate.toString());
    if (query.page) params = params.set('page', query.page.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());

    return this.http.get<BaseResponse<CashFlowReport>>(`${this.apiUrl}/reports/cash-flow`, { params });
  }

  getTopSellingProducts(query: TopSellingProductsQuery): Observable<TopSellingProduct[]> {
    let params = new HttpParams();
    params = params.set('startDate', query.startDate.toString());
    params = params.set('endDate', query.endDate.toString());
    if (query.limit) params = params.set('limit', query.limit.toString());
    if (query.categoryId) params = params.set('categoryId', query.categoryId);

    return this.http.get<TopSellingProduct[]>(`${this.apiUrl}/reports/top-selling-products`, { params });
  }

  // Stock Management Methods
  getCurrentStockLevels(): Observable<BaseResponse<StockLevel[]>> {
    return this.http.get<BaseResponse<StockLevel[]>>(`${this.apiUrl}/stock/current-levels`);
  }

  getLowStockAlerts(threshold?: number): Observable<StockLevel[]> {
    let params = new HttpParams();
    if (threshold) params = params.set('threshold', threshold.toString());
    
    return this.http.get<StockLevel[]>(`${this.apiUrl}/stock/low-stock-alerts`, { params });
  }

  // Dashboard Methods
  getDashboardSummary(): Observable<DashboardSummary> {
    return this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/summary`);
  }

  // Quick Actions
  quickAddStock(data: { productId: string; quantity: number; unitCost: number }): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/quick/add-stock`, data);
  }

  quickAdjustStock(data: { productId: string; newStock: number; reason: string }): Observable<StockMovement> {
    return this.http.post<StockMovement>(`${this.apiUrl}/quick/adjust-stock`, data);
  }
} 