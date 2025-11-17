import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ChartModule } from 'primeng/chart';
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { SkeletonModule } from 'primeng/skeleton';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ToolbarModule } from 'primeng/toolbar';
import { DropdownModule } from 'primeng/dropdown';

import { StatisticsService } from '../../../services/statistics.service';
import { DashboardStatistics } from '../../../interfaces/statistics.interface';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';
import { MultiLanguagePipe } from '../../../core/pipes/multi-language.pipe';
import { CurrencyFormatPipe } from '../../../core/pipes/currency-format.pipe';

@Component({
  selector: 'app-statistics-dashboard',
  templateUrl: './statistics-dashboard.component.html',
  styleUrls: ['./statistics-dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CardModule,
    ChartModule,
    TableModule,
    TagModule,
    SkeletonModule,
    ButtonModule,
    RippleModule,
    ToastModule,
    ToolbarModule,
    DropdownModule,
    MultiLanguagePipe,
    CurrencyFormatPipe,
  ],
  providers: [MessageService]
})
export class StatisticsDashboardComponent extends ComponentBase implements OnInit {
  statistics = signal<DashboardStatistics | null>(null);
  loading = signal<boolean>(true);

  // Chart data
  revenueChartData: any;
  salesTrendChartData: any;
  paymentMethodsChartData: any;

  chartOptions: any;

  constructor(
    private statisticsService: StatisticsService,
    private messageService: MessageService
  ) {
    super();
    this.initChartOptions();
  }

  ngOnInit() {
    this.loadStatistics();
  }

  loadStatistics() {
    this.loading.set(true);
    this.statisticsService.getDashboardStatistics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.statistics.set(response.data);
            this.updateCharts();
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to load statistics'
            });
          }
        },
        error: (error) => {
          console.error('Error loading statistics:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to load statistics'
          });
        }
      });
  }

  initChartOptions() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color-secondary');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    this.chartOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder
          }
        }
      }
    };
  }

  updateCharts() {
    const stats = this.statistics();
    if (!stats) return;

    // Sales Chart
    this.revenueChartData = {
      labels: ['Today', 'This Month', 'This Year'],
      datasets: [
        {
          label: 'Sales',
          data: [
            stats.revenue.today.revenue,
            stats.revenue.month.revenue,
            stats.revenue.year.revenue
          ],
          backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726'],
          borderColor: ['#42A5F5', '#66BB6A', '#FFA726'],
        }
      ]
    };

    // Sales Trend Chart
    if (stats.salesTrend && stats.salesTrend.length > 0) {
      this.salesTrendChartData = {
        labels: stats.salesTrend.map(t => new Date(t.date).toLocaleDateString()),
        datasets: [
          {
            label: 'Sales',
            data: stats.salesTrend.map(t => t.revenue),
            fill: false,
            borderColor: '#42A5F5',
            tension: 0.4
          },
          {
            label: 'Orders',
            data: stats.salesTrend.map(t => t.orderCount),
            fill: false,
            borderColor: '#66BB6A',
            tension: 0.4
          }
        ]
      };
    }

    // Payment Methods Chart
    if (stats.paymentMethods && stats.paymentMethods.length > 0) {
      this.paymentMethodsChartData = {
        labels: stats.paymentMethods.map(p => p.paymentMethod),
        datasets: [
          {
            data: stats.paymentMethods.map(p => p.totalRevenue),
            backgroundColor: ['#42A5F5', '#66BB6A', '#FFA726', '#EF5350', '#AB47BC']
          }
        ]
      };
    }
  }

  refresh() {
    this.loadStatistics();
  }

  recalculateStatistics() {
    this.loading.set(true);
    this.statisticsService.recalculateAllStatistics()
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => {
          this.loading.set(false);
          this.loadStatistics(); // Reload statistics after recalculation
        })
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.messageService.add({
              severity: 'success',
              summary: 'Success',
              detail: response.data.message || 'Statistics recalculated successfully'
            });
          } else {
            this.messageService.add({
              severity: 'error',
              summary: 'Error',
              detail: 'Failed to recalculate statistics'
            });
          }
        },
        error: (error) => {
          console.error('Error recalculating statistics:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to recalculate statistics'
          });
        }
      });
  }

  getChangeColor(change: number): string {
    return change >= 0 ? 'success' : 'danger';
  }

  getChangeIcon(change: number): string {
    return change >= 0 ? 'pi pi-arrow-up' : 'pi pi-arrow-down';
  }
}

