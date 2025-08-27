import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { InventoryService, DashboardSummary } from '../../../../services/inventory.service';

@Component({
  selector: 'app-inventory-dashboard',
  templateUrl: './inventory-dashboard.component.html',
  styleUrls: ['./inventory-dashboard.component.scss'],
  standalone: true,
  imports: [CommonModule, RouterModule]
})
export class InventoryDashboardComponent implements OnInit {
  dashboardData: DashboardSummary | null = null;
  loading = true;
  error = '';

  // Chart data
  profitChartData: any[] = [];
  topProductsChartData: any[] = [];

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  loadDashboardData(): void {
    this.loading = true;
    this.inventoryService.getDashboardSummary().subscribe({
      next: (data) => {
        this.dashboardData = data;
        this.prepareChartData();
        this.loading = false;
      },
      error: (error) => {
        this.error = 'فشل في تحميل بيانات اللوحة';
        this.loading = false;
        console.error('Dashboard loading error:', error);
      }
    });
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