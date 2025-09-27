import { Component, Input, OnInit, OnDestroy, signal, computed, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, finalize } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { DropdownModule } from 'primeng/dropdown';
import { CardModule } from 'primeng/card';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { OrderTimelineService } from '../../../services/order-timeline.service';
import { 
  OrderTimelineResponse, 
  OrderTimelineEvent, 
  OrderTrackingStatus, 
  AddTimelineEventRequest,
  OrderTrackingStatusLabels 
} from '../../../interfaces/order-timeline.interface';
import { TextareaModule } from 'primeng/textarea';

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ToastModule,
    DialogModule,
    ButtonModule,
    DropdownModule,
    TextareaModule,
    CardModule,
    TagModule,
    SkeletonModule
  ],
  templateUrl: './order-timeline.component.html',
  styleUrls: ['./order-timeline.component.scss']
})
export class OrderTimelineComponent implements OnInit, OnDestroy {
  @Input() orderId!: string;
  @Input() orderNumber!: string;
  @Input() visible = false;
  @Output() onClose = new EventEmitter<void>();     

  private destroy$ = new Subject<void>();

  // Signals
  timeline = signal<OrderTimelineResponse | null>(null);
  loading = signal(false);
  addingEvent = signal(false);
  showAddEventDialog = signal(false);

  // Form data
  newEvent: AddTimelineEventRequest = {
    status: OrderTrackingStatus.PROCESSING,
    note: ''
  };

  // Computed
  timelineEvents = computed(() => this.timeline()?.events || []);
  currentStatus = computed(() => this.timeline()?.currentStatus);
  currentStatusLabel = computed(() => OrderTrackingStatusLabels[this.currentStatus() || OrderTrackingStatus.PROCESSING]?.en);

  // Status options for dropdown
  statusOptions = Object.values(OrderTrackingStatus).map(status => ({
    label: OrderTrackingStatusLabels[status].en,
    value: status,
    icon: this.getStatusIcon(status)
  }));

  constructor(
    private orderTimelineService: OrderTimelineService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    if (this.orderId) {
      this.loadTimeline();
    }
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Load order timeline
   */
  loadTimeline() {
    if (!this.orderId) return;

    this.loading.set(true);
    this.orderTimelineService.getOrderTimeline(this.orderId)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.timeline.set(response.data);
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to load timeline'
            });
          }
        },
        error: (error) => {
          console.error('Error loading timeline:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load order timeline'
          });
        }
      });
  }

  /**
   * Create default timeline for the order
   */
  createDefaultTimeline(currentStatus: string) {
    if (!this.orderId) return;
    
    const defaultTimeline = this.orderTimelineService.createDefaultTimeline(this.orderId, currentStatus);
    this.timeline.set({
      orderId: this.orderId,
      events: defaultTimeline,
      currentStatus: currentStatus as any
    });
  }

  /**
   * Show add event dialog
   */
  showAddEvent() {
    this.newEvent = {
      status: this.currentStatus() || OrderTrackingStatus.PROCESSING,
      note: ''
    };
    this.showAddEventDialog.set(true);
  }

  /**
   * Add timeline event
   */
  addTimelineEvent() {
    if (!this.orderId) return;

    this.addingEvent.set(true);
    this.orderTimelineService.addTimelineEvent(this.orderId, this.newEvent)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.addingEvent.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Timeline events updated successfully'
            });
            this.showAddEventDialog.set(false);
            this.timeline.set(response.data); // Update timeline directly
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to update timeline events'
            });
          }
        },
        error: (error) => {
          console.error('Error updating timeline events:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update timeline events'
          });
        }
      });
  }

  /**
   * Cancel add event
   */
  cancelAddEvent() {
    this.showAddEventDialog.set(false);
    this.newEvent = {
      status: OrderTrackingStatus.PROCESSING,
      note: ''
    };
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: OrderTrackingStatus): string {
    const icons: { [key in OrderTrackingStatus]: string } = {
      [OrderTrackingStatus.RECEIVED]: '📥',
      [OrderTrackingStatus.CONFIRMED]: '✅',
      [OrderTrackingStatus.PROCESSING]: '⚙️',
      [OrderTrackingStatus.PREPARING]: '👨‍🍳',
      [OrderTrackingStatus.READY_FOR_PICKUP]: '📦',
      [OrderTrackingStatus.SHIPPED]: '🚚',
      [OrderTrackingStatus.OUT_FOR_DELIVERY]: '🚛',
      [OrderTrackingStatus.DELIVERED]: '🎉',
      [OrderTrackingStatus.CANCELLED]: '❌',
      [OrderTrackingStatus.RETURNED]: '↩️',
      [OrderTrackingStatus.REFUNDED]: '💰'
    };
    return icons[status] || '❓';
  }

  /**
   * Get status color
   */
  getStatusColor(status: OrderTrackingStatus): string {
    const colors: { [key in OrderTrackingStatus]: string } = {
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
    return colors[status] || 'info';
  }

  /**
   * Format date
   */
  formatDate(date: Date | string): string {
    return new Date(date).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  /**
   * Check if event is latest
   */
  isLatestEvent(event: OrderTimelineEvent): boolean {
    const events = this.timelineEvents();
    return events.length > 0 && events[0].id === event.id;
  }

  /**
   * Mark event as done
   */
  markEventAsDone(eventId: string) {
    this.orderTimelineService.markEventAsDone(eventId)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Event marked as done'
            });
            this.loadTimeline(); // Reload timeline
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to mark event as done'
            });
          }
        },
        error: (error) => {
          console.error('Error marking event as done:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to mark event as done'
          });
        }
      });
  }

  /**
   * Mark event as not done
   */
  markEventAsNotDone(eventId: string) {
    this.orderTimelineService.markEventAsNotDone(eventId)
      .pipe(
        takeUntil(this.destroy$)
      )
      .subscribe({
        next: (response) => {
          if (response.success) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Event marked as not done'
            });
            this.loadTimeline(); // Reload timeline
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: response.message || 'Failed to mark event as not done'
            });
          }
        },
        error: (error) => {
          console.error('Error marking event as not done:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to mark event as not done'
          });
        }
      });
  }
}