import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { InventoryService, ProfitReport, CashFlowReport, TopSellingProduct, BaseResponse } from '../../../../services/inventory.service';

@Component({
  selector: 'app-financial-reports',
  templateUrl: './financial-reports.component.html',
  styleUrls: ['./financial-reports.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule]
})
export class FinancialReportsComponent implements OnInit {
  // Reports data
  profitReport: ProfitReport | null = null;
  cashFlowReport: CashFlowReport | null = null;
  topProducts: TopSellingProduct[] = [];
  
  // Loading states
  loadingProfit = false;
  loadingCashFlow = false;
  loadingTopProducts = false;
  
  // Forms
  profitReportForm: FormGroup = new FormGroup({});
  cashFlowForm: FormGroup = new FormGroup({});
  topProductsForm: FormGroup = new FormGroup({});
  
  // Active tab
  activeTab = 'profit';

  // Periods
  periods = [
    { value: 'DAILY', label: 'يومي' },
    { value: 'WEEKLY', label: 'أسبوعي' },
    { value: 'MONTHLY', label: 'شهري' },
    { value: 'QUARTERLY', label: 'ربع سنوي' },
    { value: 'YEARLY', label: 'سنوي' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  ngOnInit(): void {
  }

  initForms(): void {
    // Profit Report Form
    this.profitReportForm = this.fb.group({
      period: ['MONTHLY', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      recalculate: [false]
    });

    // Cash Flow Form
    this.cashFlowForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required]
    });

    // Top Products Form
    this.topProductsForm = this.fb.group({
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      limit: [10]
    });

    // Set default dates
    const today = new Date();
    const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
    const endOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    this.profitReportForm.patchValue({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });

    this.cashFlowForm.patchValue({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });

    this.topProductsForm.patchValue({
      startDate: startOfMonth.toISOString().split('T')[0],
      endDate: endOfMonth.toISOString().split('T')[0]
    });
    this.loadDefaultReports();
  }

  loadDefaultReports(): void {
    this.generateProfitReport();
    this.generateCashFlowReport();
    this.generateTopProductsReport();
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
  }

  generateProfitReport(): void {
    if (this.profitReportForm.valid) {
      this.loadingProfit = true;
      const formData = this.profitReportForm.value;
      
      // تنظيف البيانات قبل الإرسال
      const cleanData: any = {
        period: formData.period,
        recalculate: formData.recalculate || false
      };
      
      if (formData.startDate && formData.startDate.trim() !== '') {
        cleanData.startDate = new Date(formData.startDate);
      }
      
      if (formData.endDate && formData.endDate.trim() !== '') {
        cleanData.endDate = new Date(formData.endDate);
      }
      
      this.inventoryService.generateProfitReport(cleanData).subscribe({
        next: (response: BaseResponse<ProfitReport>) => {
          this.profitReport = response.data;
          this.loadingProfit = false;
        },
        error: (error) => {
          console.error('Error generating profit report:', error);
          this.loadingProfit = false;
        }
      });
    }
  }

  generateCashFlowReport(): void {
    if (this.cashFlowForm.valid) {
      this.loadingCashFlow = true;
      const formData = this.cashFlowForm.value;
      
      // تنظيف البيانات قبل الإرسال
      const cleanData: any = {};
      
      if (formData.startDate && formData.startDate.trim() !== '') {
        cleanData.startDate = new Date(formData.startDate);
      }
      
      if (formData.endDate && formData.endDate.trim() !== '') {
        cleanData.endDate = new Date(formData.endDate);
      }
      
      this.inventoryService.getCashFlow(cleanData).subscribe({
        next: (response: BaseResponse<CashFlowReport>) => {
          this.cashFlowReport = response.data;
          this.loadingCashFlow = false;
        },
        error: (error) => {
          console.error('Error generating cash flow report:', error);
          this.loadingCashFlow = false;
        }
      });
    }
  }

  generateTopProductsReport(): void {
    if (this.topProductsForm.valid) {
      this.loadingTopProducts = true;
      const formData = this.topProductsForm.value;
      
      // تنظيف البيانات قبل الإرسال
      const cleanData: any = {
        limit: formData.limit || 10
      };
      
      if (formData.startDate && formData.startDate.trim() !== '') {
        cleanData.startDate = new Date(formData.startDate);
      }
      
      if (formData.endDate && formData.endDate.trim() !== '') {
        cleanData.endDate = new Date(formData.endDate);
      }
      
      this.inventoryService.getTopSellingProducts(cleanData).subscribe({
        next: (products: BaseResponse<TopSellingProduct[]>) => {
          this.topProducts = products.data;
          this.loadingTopProducts = false;
        },
        error: (error) => {
          console.error('Error generating top products report:', error);
          this.loadingTopProducts = false;
        }
      });
    }
  }

  getProfitColor(profit: number): string {
    return profit >= 0 ? '#27ae60' : '#e74c3c';
  }

  getCashFlowColor(amount: number): string {
    return amount >= 0 ? '#27ae60' : '#e74c3c';
  }

  getPeriodLabel(value: string): string {
    const period = this.periods.find(p => p.value === value);
    return period ? period.label : value;
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  formatPercentage(value: number): string {
    return value ? `${value?.toFixed(1)}%` : '0.0%';
  }

  getCashFlowTypeIcon(type: string): string {
    return type === 'INFLOW' ? 'fa-arrow-down' : 'fa-arrow-up';
  }

  getCashFlowTypeColor(type: string): string {
    return type === 'INFLOW' ? '#27ae60' : '#e74c3c';
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'SALES': '#27ae60',
      'RENT': '#e74c3c',
      'UTILITIES': '#3498db',
      'SALARY': '#f39c12',
      'MARKETING': '#9b59b6',
      'INVENTORY': '#2ecc71',
      'SHIPPING': '#1abc9c',
      'MAINTENANCE': '#e67e22',
      'INSURANCE': '#34495e',
      'TAXES': '#c0392b',
      'OFFICE_SUPPLIES': '#16a085',
      'TRAVEL': '#8e44ad',
      'PROFESSIONAL_SERVICES': '#27ae60',
      'OTHER': '#95a5a6'
    };
    return colors[category] || '#95a5a6';
  }

  getExpenseCategoryLabel(category: string): string {
    const labels: { [key: string]: string } = {
      'SALES': 'المبيعات',
      'RENT': 'الإيجار',
      'UTILITIES': 'المرافق',
      'SALARY': 'الرواتب',
      'MARKETING': 'التسويق',
      'INVENTORY': 'المخزون',
      'SHIPPING': 'الشحن',
      'MAINTENANCE': 'الصيانة',
      'INSURANCE': 'التأمين',
      'TAXES': 'الضرائب',
      'OFFICE_SUPPLIES': 'مستلزمات مكتبية',
      'TRAVEL': 'السفر',
      'PROFESSIONAL_SERVICES': 'خدمات مهنية',
      'OTHER': 'أخرى'
    };
    return labels[category] || category;
  }
} 