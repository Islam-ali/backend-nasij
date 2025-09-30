import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subject, takeUntil } from 'rxjs';
import { Timeline, OrderWithTimelines } from '../../../interfaces/timeline.interface';
import { TimelineService } from '../../../services/timeline.service';
import { OrderTimelineComponent } from '../order-timeline/order-timeline.component';
import { TimelineFormComponent } from '../timeline-form/timeline-form.component';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-order-timeline-manager',
  standalone: true,
  imports: [CommonModule,
     OrderTimelineComponent,
     TimelineFormComponent,
     TableModule,
     ButtonModule,
     DialogModule,
     ConfirmDialogModule,
     ToastModule,
     TooltipModule],
  templateUrl: './order-timeline-manager.component.html',
  styleUrls: ['./order-timeline-manager.component.scss'],
  providers: [ConfirmationService, MessageService]
})
export class OrderTimelineManagerComponent implements OnInit, OnDestroy {
  @Input() orderId!: string;
  
  availableTimelines: Timeline[] = [];
  showTimelineForm = false;
  showEditDialog = false;
  selectedTimeline: Timeline | null = null;
  loading = false;
  error: string | null = null;
  timelineRefreshTrigger = 0; // Trigger for refreshing order timeline display
  
  private destroy$ = new Subject<void>();
  
  constructor(
    private timelineService: TimelineService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadAvailableTimelines();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadAvailableTimelines(): void {
    this.loading = true;
    this.error = null;
    
    this.timelineService.getTimelines()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.availableTimelines = response.data || [];
          this.loading = false;
        },
        error: (error) => {
          this.error = error?.message || 'Failed to load available timelines';
          this.loading = false;
        }
      });
  }

  onTimelineCreated(timeline: Timeline): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Timeline created successfully'
    });
    this.loadAvailableTimelines();
    this.showTimelineForm = false;
  }

  onTimelineAddedToOrder(): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Timeline added to order successfully'
    });
    this.showTimelineForm = false;
    // Trigger refresh of order timeline display
    this.refreshOrderTimelineDisplay();
  }

  onFormCancelled(): void {
    this.showTimelineForm = false;
  }

  toggleTimelineForm(): void {
    this.showTimelineForm = !this.showTimelineForm;
  }

  createNewTimeline(): void {
    // Show form for creating a new timeline
    this.showTimelineForm = true;
  }

  addExistingTimelineToOrder(): void {
    // Show form for adding existing timeline to order
    this.showTimelineForm = true;
  }

  editTimeline(timeline: Timeline): void {
    this.selectedTimeline = timeline;
    this.showEditDialog = true;
  }

  deleteTimeline(timeline: Timeline): void {
    this.confirmationService.confirm({
      message: `Are you sure you want to delete the timeline "${timeline.name.en}"?`,
      header: 'Confirm Deletion',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Yes, Delete',
      rejectLabel: 'Cancel',
      accept: () => {
        this.performDelete(timeline);
      }
    });
  }

  private performDelete(timeline: Timeline): void {
    this.loading = true;
    this.timelineService.deleteTimeline(timeline._id)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: () => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Timeline deleted successfully'
          });
          this.loadAvailableTimelines(); // Refresh the list
          this.loading = false;
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error?.message || 'Failed to delete timeline'
          });
          this.loading = false;
        }
      });
  }

  onEditDialogClose(): void {
    this.showEditDialog = false;
    this.selectedTimeline = null;
  }

  onTimelineUpdated(timeline: Timeline): void {
    this.messageService.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Timeline updated successfully'
    });
    this.loadAvailableTimelines(); // Refresh the list
    this.onEditDialogClose();
  }

  getTimelineIcon(icon: string): string {
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
    
    return iconMap[icon] || '📋';
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

  private refreshOrderTimelineDisplay(): void {
    // Increment the trigger to force refresh of order timeline component
    this.timelineRefreshTrigger++;
  }
}