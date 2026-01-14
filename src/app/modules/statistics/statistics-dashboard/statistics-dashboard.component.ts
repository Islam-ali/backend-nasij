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
import { CalendarModule } from 'primeng/calendar';

import { StatisticsService } from '../../../services/statistics.service';
import { EcommerceStatistics } from '../../../interfaces/statistics.interface';
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
    CalendarModule,
    MultiLanguagePipe,
    CurrencyFormatPipe,
  ],
  providers: [MessageService]
})
export class StatisticsDashboardComponent extends ComponentBase implements OnInit {
  ecommerceStatistics = signal<EcommerceStatistics | null>(null);
  loading = signal<boolean>(true);

  // Date Filter
  periodOptions = [
    { label: 'اليوم', value: 'day' },
    { label: 'الشهر الحالي', value: 'month' },
    { label: 'السنة الحالية', value: 'year' },
    { label: 'نطاق مخصص', value: 'custom' }
  ];
  selectedPeriod: 'day' | 'month' | 'year' | 'custom' = 'month';
  startDate: Date | null = null;
  endDate: Date | null = null;
  showDateRange = false;

  // Chart data
  revenueChartData: any;
  salesTrendChartData: any;
  paymentMethodsChartData: any;
  profitChartData: any;
  profitBreakdownChartData: any;

  chartOptions: any;
  profitChartOptions: any;
  profitBreakdownChartOptions: any;

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

  onPeriodChange() {
    this.showDateRange = this.selectedPeriod === 'custom';
    if (this.selectedPeriod !== 'custom') {
      this.startDate = null;
      this.endDate = null;
    }
    this.loadStatistics();
  }

  onDateRangeChange() {
    if (this.startDate && this.endDate) {
      this.loadStatistics();
    }
  }

  loadStatistics() {
    this.loading.set(true);
    
    let period: 'day' | 'month' | 'year' | undefined = undefined;
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    if (this.selectedPeriod === 'custom') {
      if (this.startDate && this.endDate) {
        startDate = this.startDate.toISOString();
        endDate = this.endDate.toISOString();
      } else {
        this.loading.set(false);
        return;
      }
    } else {
      period = this.selectedPeriod;
    }

    this.statisticsService.getEcommerceStatistics(period, startDate, endDate)
      .pipe(
        takeUntil(this.destroy$),
        finalize(() => this.loading.set(false))
      )
      .subscribe({
        next: (response) => {
          if (response.success && response.data) {
            this.ecommerceStatistics.set(response.data);
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

    // Bar Chart Options (for profit breakdown)
    this.profitBreakdownChartOptions = {
      responsive: true,
      maintainAspectRatio: true,
      aspectRatio: 1.5,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: (context: any) => {
              return `${new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(context.parsed.y)}`;
            }
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary,
            callback: (value: any) => {
              return new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP', notation: 'compact' }).format(value);
            }
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
  }

  updateCharts() {
    const stats = this.ecommerceStatistics();
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

    // Profit Chart
    if (stats.profit) {
      this.profitChartData = {
        labels: ['الإيرادات', 'تكلفة البضاعة', 'المصروفات', 'الربح الإجمالي', 'صافي الربح'],
        datasets: [
          {
            label: 'المبلغ',
            data: [
              stats.profit.revenue,
              stats.profit.costOfGoodsSold,
              stats.profit.expenses,
              stats.profit.grossProfit,
              stats.profit.netProfit
            ],
            backgroundColor: [
              'rgba(66, 165, 245, 0.8)',   // Revenue - Blue
              'rgba(255, 152, 0, 0.8)',    // COGS - Orange
              'rgba(239, 83, 80, 0.8)',    // Expenses - Red
              'rgba(102, 187, 106, 0.8)',  // Gross Profit - Green
              'rgba(156, 39, 176, 0.8)'    // Net Profit - Purple
            ],
            borderColor: [
              'rgba(66, 165, 245, 1)',
              'rgba(255, 152, 0, 1)',
              'rgba(239, 83, 80, 1)',
              'rgba(102, 187, 106, 1)',
              'rgba(156, 39, 176, 1)'
            ],
            borderWidth: 2
          }
        ]
      };

      // Profit Breakdown Pie Chart
      this.profitBreakdownChartData = {
        labels: ['الإيرادات', 'المصروفات', 'صافي الربح'],
        datasets: [
          {
            data: [
              stats.profit.revenue,
              stats.profit.expenses,
              stats.profit.netProfit
            ],
            backgroundColor: [
              'rgba(66, 165, 245, 0.8)',
              'rgba(239, 83, 80, 0.8)',
              'rgba(102, 187, 106, 0.8)'
            ],
            borderColor: [
              'rgba(66, 165, 245, 1)',
              'rgba(239, 83, 80, 1)',
              'rgba(102, 187, 106, 1)'
            ],
            borderWidth: 2
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

