import { Component, Input, OnInit, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil } from 'rxjs';
import { OrderWithTimelines, OrderTimelineEntry } from '../../../interfaces/timeline.interface';
import { TimelineService } from '../../../services/timeline.service';
import { CommonService } from '../../../core/services/common.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-order-timeline',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './order-timeline.component.html',
  styleUrls: ['./order-timeline.component.scss'],
  providers: [MessageService]
})
export class OrderTimelineComponent implements OnInit, OnDestroy, OnChanges {
  @Input() orderId!: string;
  @Input() refreshTrigger: number = 0; // This will trigger refresh when changed
  
  orderTimelines: OrderWithTimelines | null = null;
  loading = false;
  error: string | null = null;
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private timelineService: TimelineService,
    private commonService: CommonService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    if (this.orderId) {
      this.loadOrderTimelines();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Trigger refresh when refreshTrigger changes
    if (changes['refreshTrigger'] && !changes['refreshTrigger'].firstChange && this.orderId) {
      this.loadOrderTimelines();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadOrderTimelines(): void {
    this.loading = true;
    this.error = null;
    
    this.timelineService.getOrderTimelines(this.orderId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.orderTimelines = response.data;
          this.loading = false;
        },
        error: (error) => {
          this.error = error?.message || 'Failed to load timelines';
          this.loading = false;
        }
      });
  }

  formatDateTime(dateTime: Date | string): string {
    const date = new Date(dateTime);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getTimelineIcon(timeline: any): string {
    // Map common timeline icons or use default
    const iconMap: { [key: string]: string } = {
      'order-placed': '📦',
      'order-confirmed': '✅',
      'processing': '⚙️',
      'shipped': '🚚',
      'delivered': '🏠',
      'cancelled': '❌',
      'refunded': '💰'
    };
    
    return iconMap[timeline.icon] || '📋';
  }

  removeTimeline(timelineId: string): void {
    if (confirm('Are you sure you want to remove this timeline entry?')) {
      this.timelineService.removeTimelineFromOrder(this.orderId, timelineId)
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: () => {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: 'Timeline removed from order successfully'
            });
            this.loadOrderTimelines(); // Reload timelines
          },
          error: (error) => {
            this.error = error?.message || 'Failed to remove timeline';
          }
        });
    }
  }
}