import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

interface Transaction {
  date: Date;
  type: string;
  description: string;
  amount: number;
  status: string;
}

@Component({
  selector: 'app-quick-actions',
  templateUrl: './quick-actions.component.html',
  styleUrls: ['./quick-actions.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class QuickActionsComponent implements OnInit {
  
  recentTransactions: Transaction[] = [];

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadRecentTransactions();
  }

  // Quick Order Creation
  createQuickOrder() {
    this.router.navigate(['/orders/create']);
  }

  // Stock Management
  manageStock() {
    this.router.navigate(['/inventory/stock']);
  }

  // Financial Reports
  viewFinancialReports() {
    this.router.navigate(['/inventory/reports']);
  }

  // Expense Management
  manageExpenses() {
    this.router.navigate(['/inventory/expenses']);
  }

  // Low Stock Alerts
  viewLowStockAlerts() {
    this.router.navigate(['/inventory/stock-levels']);
  }

  // Accounting Dashboard
  viewAccountingDashboard() {
    this.router.navigate(['/inventory/dashboard']);
  }

  // Load recent transactions
  loadRecentTransactions() {
    // Mock data - replace with actual API call
    this.recentTransactions = [
      {
        date: new Date(),
        type: 'revenue',
        description: 'طلب #12345',
        amount: 150.00,
        status: 'مكتمل'
      },
      {
        date: new Date(Date.now() - 86400000),
        type: 'expense',
        description: 'تكلفة البضائع المباعة',
        amount: -75.00,
        status: 'مكتمل'
      },
      {
        date: new Date(Date.now() - 172800000),
        type: 'revenue',
        description: 'طلب #12344',
        amount: 200.00,
        status: 'مكتمل'
      }
    ];
  }

  // Get transaction type class for styling
  getTransactionTypeClass(type: string): string {
    switch (type) {
      case 'revenue':
        return 'badge badge-success';
      case 'expense':
        return 'badge badge-danger';
      case 'stock':
        return 'badge badge-info';
      default:
        return 'badge badge-secondary';
    }
  }

  // Get transaction type text
  getTransactionTypeText(type: string): string {
    switch (type) {
      case 'revenue':
        return 'إيرادات';
      case 'expense':
        return 'مصروفات';
      case 'stock':
        return 'مخزون';
      default:
        return 'أخرى';
    }
  }

  // Get status class for styling
  getStatusClass(status: string): string {
    switch (status) {
      case 'مكتمل':
        return 'badge badge-success';
      case 'قيد المعالجة':
        return 'badge badge-warning';
      case 'ملغي':
        return 'badge badge-danger';
      default:
        return 'badge badge-secondary';
    }
  }
} 