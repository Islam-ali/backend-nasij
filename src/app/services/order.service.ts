import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../interfaces/order.interface';
import { CommonService } from '../core/services/common.service';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse, pagination } from '../core/models/baseResponse';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = 'https://nasig-backend-sigma.vercel.app/api/v1/orders';

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService) {}

  getOrders(queryParams?: any): Observable<BaseResponse<{orders: Order[], pagination: pagination}>> {
    return this.genericApiService.Get(this.apiUrl, queryParams);
  }

  getOrder(id: string): Observable<BaseResponse<Order>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  createOrder(order: Order): Observable<BaseResponse<Order>> {
    return this.genericApiService.Post(this.apiUrl, this.commonService.removeNullUndefinedEmptyStringKeys(order));
  }

  updateOrder(id: string, order: Partial<Order>): Observable<BaseResponse<Order>> {
    return this.genericApiService.Put(`${this.apiUrl}`, id, this.commonService.removeNullUndefinedEmptyStringKeys(order));
  }

  deleteOrder(id: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Delete(`${this.apiUrl}`, id);
  }

  updateOrderStatus(id: string, status: OrderStatus): Observable<BaseResponse<Order>> {
    return this.genericApiService.Put(
      `${this.apiUrl}/${id}/status`, 
      id, 
      { status }
    );
  }

  updatePaymentStatus(id: string, status: PaymentStatus): Observable<BaseResponse<Order>> {
    return this.genericApiService.Put(
      `${this.apiUrl}/${id}/payment-status`, 
      id, 
      { status }
    );
  }
}
