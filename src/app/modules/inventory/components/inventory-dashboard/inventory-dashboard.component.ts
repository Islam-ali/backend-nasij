import { ChangeDetectorRef, Component, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { CommonModule, CurrencyPipe, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService, DashboardSummary } from '../../../../services/inventory.service';
import { ChartModule } from 'primeng/chart';
@Component({
  selector: 'app-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule, ChartModule],
  providers: [CurrencyPipe]
})
export class InventoryDashboardComponent implements OnInit {
  dashboardData: DashboardSummary | null = null;
  loading = true;
  error = '';
  currencyPipe = inject(CurrencyPipe);
  platformId = inject(PLATFORM_ID);
  // Chart data
  profitChartData: any[] = [];
  topProductsChartData: any[] = [];
  chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false
      }
    }
  };
  data: any;
  options: any;
  constructor(
    private inventoryService: InventoryService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.inventoryService.getDashboardSummary().subscribe({
      next: (data) => {
        this.dashboardData = data.data;
        this.prepareChartData();
        this.initChart();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'فشل في تحميل بيانات اللوحة';
        this.loading = false;
        console.error('Dashboard loading error:', error);
      }
    });
  }
  initChart() {
    if (isPlatformBrowser(this.platformId)) {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--p-text-color');
        const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
        const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

        this.data = {
            labels: ['الإيرادات', 'المصروفات', 'صافي الربح'],
            datasets: [
                {
                    label: '',
                    data: [this.dashboardData?.monthlyProfit?.revenue, this.dashboardData?.monthlyProfit?.expenses, this.dashboardData?.monthlyProfit?.netProfit],
                    fill: false,
                    borderColor: documentStyle.getPropertyValue('--p-cyan-500'),
                    tension: 0.4
                }
            ]
        };

        this.options = {
            maintainAspectRatio: false,
            aspectRatio: 0.6,
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
                        color: surfaceBorder,
                        drawBorder: false
                    }
                },
                y: {
                    ticks: {
                        color: textColorSecondary
                    },
                    grid: {
                        color: surfaceBorder,
                        drawBorder: false
                    }
                }
            }
        };
        this.cd.markForCheck();
    }
}

  prepareChartData(): void {
    if (this.dashboardData) {
        
      // Profit chart data
      this.profitChartData = [
        {
          name: 'الإيرادات',
          value: this.dashboardData.monthlyProfit?.revenue,
          color: '#4CAF50'
        },
        {
          name: 'المصروفات',
          value: this.dashboardData.monthlyProfit?.expenses,
          color: '#F44336'
        },
        {
          name: 'صافي الربح',
          value: this.dashboardData.monthlyProfit?.netProfit,
          color: '#2196F3'
        }
      ];

      // Top products chart data
      if (this.dashboardData.topSellingProducts) {
      this.topProductsChartData = this.dashboardData.topSellingProducts?.map(product => ({
        name: product.productName,
        value: product.quantitySold,
        revenue: product.revenue,
          profit: product.profit
        }));
      }
    }
  }

  getProfitColor(profit: number): string {
    return profit >= 0 ? '#4CAF50' : '#F44336';
  }

  getStockAlertColor(count: number): string {
    if (count === 0) return '#4CAF50';
    if (count <= 5) return '#FF9800';
    return '#F44336';
  }

  getBarPercentage(value: number): number {
    if (!this.dashboardData) return 0;
    const maxValue = Math.max(
      this.dashboardData.monthlyProfit?.revenue,
      this.dashboardData.monthlyProfit?.expenses,
      Math.abs(this.dashboardData.monthlyProfit?.netProfit)
    );
    return maxValue > 0 ? (value / maxValue) * 100 : 0;
  }

  refreshData(): void {
    this.loadDashboardData();
  }
} 