import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Order, OrderStatus, PaymentMethod, PaymentStatus } from '../interfaces/order.interface';
import { CommonService } from '../core/services/common.service';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse, pagination } from '../core/models/baseResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private apiUrl = `${environment.apiUrl}/orders`;

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
    // Transform the order data to match backend expectations
    const transformedOrder = this.transformOrderForBackend(order);
    return this.genericApiService.Post(this.apiUrl, this.commonService.removeNullUndefinedEmptyStringKeys(transformedOrder));
  }

  updateOrder(id: string, order: Partial<Order>): Observable<BaseResponse<Order>> {
    // Transform the order data to match backend expectations
    const transformedOrder = this.transformOrderForBackend(order);
    const cleanedOrder = this.commonService.removeNullUndefinedEmptyStringKeysAndId(transformedOrder);
    
    console.log('🔧 Order Update Debug:', {
      originalOrder: order,
      transformedOrder: transformedOrder,
      cleanedOrder: cleanedOrder,
      id: id,
      url: `${this.apiUrl}/${id}`
    });
    
    return this.genericApiService.Put(`${this.apiUrl}`, id, cleanedOrder);
  }

  private transformOrderForBackend(order: Partial<Order>): any {
    if (!order) return order;
    
    const transformed = { ...order };
    
    // Transform items to match backend expectations
    if (transformed.items && Array.isArray(transformed.items)) {
      transformed.items = transformed.items.map(item => ({
        ...item,
        productId: typeof item.productId === 'object' && item.productId !== null 
          ? (item.productId as any)._id || item.productId 
          : item.productId
      }));
    }
    
    return transformed;
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
