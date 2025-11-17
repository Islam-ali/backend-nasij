import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DashboardStatistics, RevenueStatistics, TopProduct, TopPackage, CustomerStatistics, TopState, OrderCountStatistics, AverageOrderValue, SalesTrend, PaymentMethodStatistics } from '../interfaces/statistics.interface';
import { CommonService } from '../core/services/common.service';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse } from '../core/models/baseResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StatisticsService {
  private apiUrl = `${environment.apiUrl}/statistics`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  getDashboardStatistics(): Observable<BaseResponse<DashboardStatistics>> {
    return this.genericApiService.Get(`${this.apiUrl}/dashboard`);
  }

  getRevenueStatistics(): Observable<BaseResponse<RevenueStatistics>> {
    return this.genericApiService.Get(`${this.apiUrl}/revenue`);
  }

  getTopProducts(limit?: number): Observable<BaseResponse<TopProduct[]>> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.genericApiService.Get(`${this.apiUrl}/top-products`, params);
  }

  getTopPackages(limit?: number): Observable<BaseResponse<TopPackage[]>> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.genericApiService.Get(`${this.apiUrl}/top-packages`, params);
  }

  getTopCustomersByOrders(limit?: number): Observable<BaseResponse<CustomerStatistics[]>> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.genericApiService.Get(`${this.apiUrl}/top-customers-orders`, params);
  }

  getTopCustomersByAmount(limit?: number): Observable<BaseResponse<CustomerStatistics[]>> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.genericApiService.Get(`${this.apiUrl}/top-customers-amount`, params);
  }

  getTopStates(limit?: number): Observable<BaseResponse<TopState[]>> {
    const params = limit ? { limit: limit.toString() } : undefined;
    return this.genericApiService.Get(`${this.apiUrl}/top-states`, params);
  }

  getTotalCustomers(): Observable<BaseResponse<{ total: number }>> {
    return this.genericApiService.Get(`${this.apiUrl}/total-customers`);
  }

  getOrderCountStatistics(): Observable<BaseResponse<OrderCountStatistics>> {
    return this.genericApiService.Get(`${this.apiUrl}/order-count`);
  }

  getAverageOrderValue(): Observable<BaseResponse<AverageOrderValue>> {
    return this.genericApiService.Get(`${this.apiUrl}/average-order-value`);
  }

  getSalesTrend(days?: number): Observable<BaseResponse<SalesTrend[]>> {
    const params = days ? { days: days.toString() } : undefined;
    return this.genericApiService.Get(`${this.apiUrl}/sales-trend`, params);
  }

  getPaymentMethodStatistics(): Observable<BaseResponse<PaymentMethodStatistics[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/payment-methods`);
  }

  getOrderStatisticsByDateRange(startDate: string, endDate: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Get(`${this.apiUrl}/orders-by-date-range`, {
      startDate,
      endDate
    });
  }

  recalculateAllStatistics(): Observable<BaseResponse<{
    productsUpdated: number;
    packagesUpdated: number;
    customersUpdated: number;
    message: string;
  }>> {
    return this.genericApiService.Get(`${this.apiUrl}/recalculate`);
  }
}

