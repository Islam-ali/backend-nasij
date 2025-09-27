import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { CommonService } from '../core/services/common.service';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse } from '../core/models/baseResponse';
import { environment } from '../../environments/environment';
import { OrderTimelineEvent, OrderTimelineResponse, AddTimelineEventRequest } from '../interfaces/order-timeline.interface';

@Injectable({
  providedIn: 'root'
})
export class OrderTimelineService {
  private apiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  /**
   * Get order timeline
   */
  getOrderTimeline(orderId: string): Observable<BaseResponse<OrderTimelineResponse>> {
    return this.genericApiService.Get(`${this.apiUrl}/${orderId}/timeline`);
  }

  /**
   * Add timeline event
   */
  addTimelineEvent(orderId: string, event: AddTimelineEventRequest): Observable<BaseResponse<OrderTimelineResponse>> {
    const cleanedEvent = this.commonService.removeNullUndefinedEmptyStringKeys(event);
    return this.genericApiService.Post(`${this.apiUrl}/${orderId}/timeline`, cleanedEvent);
  }

  /**
   * Update order status with timeline event
   */
  updateOrderStatusWithTimeline(orderId: string, status: string, note?: string): Observable<BaseResponse<OrderTimelineResponse>> {
    const event: AddTimelineEventRequest = {
      status: status as any,
      note: note || this.getDefaultNoteForStatus(status)
    };
    return this.addTimelineEvent(orderId, event);
  }

  /**
   * Get default note for status
   */
  private getDefaultNoteForStatus(status: string): string {
    const statusNotes: { [key: string]: string } = {
      'received': 'Order has been received',
      'confirmed': 'Order has been confirmed',
      'processing': 'Order is being processed',
      'preparing': 'Order is being prepared',
      'ready_for_pickup': 'Order is ready for pickup',
      'shipped': 'Order has been shipped',
      'out_for_delivery': 'Order is out for delivery',
      'delivered': 'Order has been delivered',
      'cancelled': 'Order has been cancelled',
      'returned': 'Order has been returned',
      'refunded': 'Order has been refunded'
    };
    return statusNotes[status] || 'Order status updated';
  }

  /**
   * Create default timeline for an order
   */
  createDefaultTimeline(orderId: string, currentStatus: string): OrderTimelineEvent[] {
    const allStatuses = ['received', 'confirmed', 'processing', 'preparing', 'ready_for_pickup', 'shipped', 'out_for_delivery', 'delivered', 'cancelled', 'returned', 'refunded'];
    const currentIndex = allStatuses.indexOf(currentStatus);
    
    return allStatuses.map((status, index) => ({
      id: `default-${orderId}-${status}`,
      orderId,
      status: status as any,
      icon: this.getStatusDisplayInfo(status).icon as any,
      dateTime: new Date(),
      note: this.getDefaultNoteForStatus(status),
      statusLabel: this.getStatusDisplayInfo(status).label,
      createdAt: new Date(),
      updatedAt: new Date(),
      isDone: index <= currentIndex, // Mark as done if it's the current status or before
    }));
  }

  /**
   * Mark timeline event as done
   */
  markEventAsDone(eventId: string): Observable<BaseResponse<OrderTimelineEvent>> {
    return this.genericApiService.Put(`${this.apiUrl}/timeline/${eventId}/done`, {});
  }

  /**
   * Mark timeline event as not done
   */
  markEventAsNotDone(eventId: string): Observable<BaseResponse<OrderTimelineEvent>> {
    return this.genericApiService.Put(`${this.apiUrl}/timeline/${eventId}/not-done`, {});
  }

  /**
   * Get status display info
   */
  getStatusDisplayInfo(status: string): { icon: string; label: { en: string; ar: string }; color: string } {
    const statusInfo: { [key: string]: { icon: string; label: { en: string; ar: string }; color: string } } = {
      'received': {
        icon: '📥',
        label: { en: 'Received', ar: 'تم الاستلام' },
        color: 'info'
      },
      'confirmed': {
        icon: '✅',
        label: { en: 'Confirmed', ar: 'تم التأكيد' },
        color: 'success'
      },
      'processing': {
        icon: '⚙️',
        label: { en: 'Processing', ar: 'قيد المعالجة' },
        color: 'warning'
      },
      'preparing': {
        icon: '👨‍🍳',
        label: { en: 'Preparing', ar: 'قيد التحضير' },
        color: 'warning'
      },
      'ready_for_pickup': {
        icon: '📦',
        label: { en: 'Ready for Pickup', ar: 'جاهز للاستلام' },
        color: 'help'
      },
      'shipped': {
        icon: '🚚',
        label: { en: 'Shipped', ar: 'تم الشحن' },
        color: 'secondary'
      },
      'out_for_delivery': {
        icon: '🚛',
        label: { en: 'Out for Delivery', ar: 'خارج للتوصيل' },
        color: 'help'
      },
      'delivered': {
        icon: '🎉',
        label: { en: 'Delivered', ar: 'تم التوصيل' },
        color: 'success'
      },
      'cancelled': {
        icon: '❌',
        label: { en: 'Cancelled', ar: 'تم الإلغاء' },
        color: 'danger'
      },
      'returned': {
        icon: '↩️',
        label: { en: 'Returned', ar: 'تم الإرجاع' },
        color: 'warning'
      },
      'refunded': {
        icon: '💰',
        label: { en: 'Refunded', ar: 'تم الاسترداد' },
        color: 'info'
      }
    };
    return statusInfo[status] || { icon: '❓', label: { en: 'Unknown', ar: 'غير معروف' }, color: 'gray' };
  }
}