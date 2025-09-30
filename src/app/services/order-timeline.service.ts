import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { OrderTrackingStatus } from '../interfaces/order-timeline.interface';
import { BaseResponse } from './inventory.service';

export interface TimelineStep {
  id: string;
  orderId: string;
  status: OrderTrackingStatus;
  icon: string;
  timestamp: Date;
  note?: string;
  current: boolean;
  updatedBy?: string;
  metadata?: any;
  statusLabel: string;
}

export interface TimelineResponse {
  orderId: string;
  steps: TimelineStep[];
  currentStatus: OrderTrackingStatus;
  currentStatusLabel: string;
}

export interface CreateTimelineStepDto {
  orderId: string;
  status: OrderTrackingStatus;
  note?: string;
  updatedBy?: string;
  metadata?: any;
}

export interface UpdateOrderStatusDto {
  status: OrderTrackingStatus;
  note?: string;
  updatedBy?: string;
  metadata?: any;
}

export interface TimelineStats {
  totalSteps: number;
  currentStep: number;
  completedSteps: number;
  averageStepDuration: number;
}

@Injectable({
  providedIn: 'root'
})
export class OrderTimelineService {
  private readonly apiUrl = `${environment.apiUrl}/orders`;

  constructor(private http: HttpClient) {}

  /**
   * Get timeline for a specific order
   */
  getTimeline(orderId: string): Observable<BaseResponse<TimelineResponse>> {
    return this.http.get<BaseResponse<TimelineResponse>>(`${this.apiUrl}/${orderId}/timeline`);
  }

  /**
   * Add a new timeline step
   */
  addTimelineStep(createTimelineStepDto: CreateTimelineStepDto): Observable<TimelineResponse> {
    return this.http.post<TimelineResponse>(
      `${this.apiUrl}/${createTimelineStepDto.orderId}/timeline`,
      createTimelineStepDto
    );
  }

  /**
   * Update order status and create timeline step
   */
  updateOrderStatus(
    orderId: string,
    updateOrderStatusDto: UpdateOrderStatusDto
  ): Observable<TimelineResponse> {
    return this.http.put<TimelineResponse>(
      `${this.apiUrl}/${orderId}/status`,
      updateOrderStatusDto
    );
  }

  /**
   * Get current timeline step
   */
  getCurrentStep(orderId: string): Observable<TimelineStep | null> {
    return this.http.get<TimelineStep | null>(`${this.apiUrl}/${orderId}/timeline/current`);
  }

  /**
   * Get timeline steps by status
   */
  getStepsByStatus(orderId: string, status: OrderTrackingStatus): Observable<TimelineStep[]> {
    return this.http.get<TimelineStep[]>(`${this.apiUrl}/${orderId}/timeline/status/${status}`);
  }

  /**
   * Get timeline statistics
   */
  getTimelineStats(orderId: string): Observable<TimelineStats> {
    return this.http.get<TimelineStats>(`${this.apiUrl}/${orderId}/timeline/stats`);
  }

  /**
   * Delete timeline step
   */
  deleteTimelineStep(stepId: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${this.apiUrl}/timeline/${stepId}`);
  }

  /**
   * Get default note for status
   */
  getDefaultNoteForStatus(status: OrderTrackingStatus): string {
    const defaultNotes: Record<OrderTrackingStatus, string> = {
      [OrderTrackingStatus.RECEIVED]: 'Order received and being processed',
      [OrderTrackingStatus.CONFIRMED]: 'Order confirmed and payment verified',
      [OrderTrackingStatus.PROCESSING]: 'Order is being processed',
      [OrderTrackingStatus.PREPARING]: 'Order is being prepared for shipment',
      [OrderTrackingStatus.READY_FOR_PICKUP]: 'Order is ready for pickup',
      [OrderTrackingStatus.SHIPPED]: 'Order has been shipped',
      [OrderTrackingStatus.OUT_FOR_DELIVERY]: 'Order is out for delivery',
      [OrderTrackingStatus.DELIVERED]: 'Order has been delivered successfully',
      [OrderTrackingStatus.CANCELLED]: 'Order has been cancelled',
      [OrderTrackingStatus.RETURNED]: 'Order has been returned',
      [OrderTrackingStatus.REFUNDED]: 'Order has been refunded',
    };

    return defaultNotes[status] || 'Status updated';
  }

  /**
   * Get status display info
   */
  getStatusDisplayInfo(status: OrderTrackingStatus): { icon: string; label: string; color: string } {
    const statusInfo = {
      [OrderTrackingStatus.RECEIVED]: { icon: '📥', label: 'Received', color: '#6b7280' },
      [OrderTrackingStatus.CONFIRMED]: { icon: '✅', label: 'Confirmed', color: '#10b981' },
      [OrderTrackingStatus.PROCESSING]: { icon: '⚙️', label: 'Processing', color: '#3b82f6' },
      [OrderTrackingStatus.PREPARING]: { icon: '👨‍🍳', label: 'Preparing', color: '#f59e0b' },
      [OrderTrackingStatus.READY_FOR_PICKUP]: { icon: '📦', label: 'Ready for Pickup', color: '#8b5cf6' },
      [OrderTrackingStatus.SHIPPED]: { icon: '🚚', label: 'Shipped', color: '#06b6d4' },
      [OrderTrackingStatus.OUT_FOR_DELIVERY]: { icon: '🚛', label: 'Out for Delivery', color: '#ef4444' },
      [OrderTrackingStatus.DELIVERED]: { icon: '🎉', label: 'Delivered', color: '#10b981' },
      [OrderTrackingStatus.CANCELLED]: { icon: '❌', label: 'Cancelled', color: '#ef4444' },
      [OrderTrackingStatus.RETURNED]: { icon: '↩️', label: 'Returned', color: '#f59e0b' },
      [OrderTrackingStatus.REFUNDED]: { icon: '💰', label: 'Refunded', color: '#8b5cf6' },
    };

    return statusInfo[status] || { icon: '📋', label: 'Unknown', color: '#6b7280' };
  }

  /**
   * Calculate timeline progress
   */
  calculateProgress(steps: TimelineStep[]): number {
    if (steps.length === 0) return 0;
    const currentIndex = steps.findIndex(step => step.current);
    return currentIndex >= 0 ? ((currentIndex + 1) / steps.length) * 100 : 0;
  }

  /**
   * Get timeline statistics
   */
  getTimelineStatistics(steps: TimelineStep[]): {
    totalSteps: number;
    currentStep: number;
    completedSteps: number;
    averageStepDuration: number;
  } {
    const totalSteps = steps.length;
    const currentIndex = steps.findIndex(step => step.current);
    const completedSteps = currentIndex >= 0 ? currentIndex : totalSteps;

    let averageStepDuration = 0;
    if (steps.length > 1) {
      const firstStep = steps[0].timestamp;
      const lastStep = steps[steps.length - 1].timestamp;
      const totalDuration = new Date(lastStep).getTime() - new Date(firstStep).getTime();
      averageStepDuration = totalDuration / (steps.length - 1);
    }

    return {
      totalSteps,
      currentStep: currentIndex + 1,
      completedSteps,
      averageStepDuration,
    };
  }

  /**
   * Format timestamp for display
   */
  formatTimestamp(timestamp: Date): string {
    return new Date(timestamp).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Get relative time
   */
  getRelativeTime(timestamp: Date): string {
    const now = new Date();
    const diff = now.getTime() - new Date(timestamp).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  }
}