import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { InventoryService, Revenue } from '../../../../services/inventory.service';

// PrimeNG Imports
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { CardModule } from 'primeng/card';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { PaginatorModule } from 'primeng/paginator';
import { TagModule } from 'primeng/tag';

// Custom Pipes
import {
  DateFormatPipe,
  CurrencyFormatPipe,
  CategoryLabelPipe,
  PaymentMethodLabelPipe,
  StatusLabelPipe,
  SeverityColorPipe
} from '../../../../core/pipes';

// Interfaces
interface PageEvent {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

interface PaginatorState {
  page: number;
  first: number;
  rows: number;
  pageCount: number;
}

interface RevenueCategory {
  label: string;
  value: string;
}

interface PaymentMethod {
  label: string;
  value: string;
}

@Component({
  selector: 'app-revenue-management',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    CardModule,
    ProgressSpinnerModule,
    ToastModule,
    PaginatorModule,
    TagModule,
    DateFormatPipe,
    CurrencyFormatPipe,
    CategoryLabelPipe,
    PaymentMethodLabelPipe,
    StatusLabelPipe,
    SeverityColorPipe
  ],
  providers: [MessageService],
  templateUrl: './revenue-management.component.html',
  styleUrls: ['./revenue-management.component.scss']
})
export class RevenueManagementComponent implements OnInit {
  revenues: Revenue[] = [];
  loading = false;
  recalculating = false;
  
  // Pagination
  totalItems = 0;
  currentPage = 1;
  pageSize = 10;
  
  // Filters
  filters = {
    startDate: null as Date | null,
    endDate: null as Date | null,
    category: '',
    paymentMethod: ''
  };

  // PrimeNG Dropdown Options
  categoryOptions: RevenueCategory[] = [
    { label: 'الكل', value: '' },
    { label: 'المبيعات', value: 'SALES' },
    { label: 'الشحن', value: 'SHIPPING' },
    { label: 'الخصم', value: 'DISCOUNT' },
    { label: 'أخرى', value: 'OTHER' }
  ];

  paymentMethodOptions: PaymentMethod[] = [
    { label: 'الكل', value: '' },
    { label: 'نقداً', value: 'CASH' },
    { label: 'بطاقة ائتمان', value: 'CREDIT_CARD' },
    { label: 'PayPal', value: 'PAYPAL' },
    { label: 'تحويل بنكي', value: 'BANK_TRANSFER' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.loadRevenues();
  }

  loadRevenues(): void {
    this.loading = true;
    
    const params: any = {
      page: this.currentPage,
      limit: this.pageSize
    };

    if (this.filters.startDate) {
      params.startDate = this.filters.startDate.toISOString();
    }
    if (this.filters.endDate) {
      params.endDate = this.filters.endDate.toISOString();
    }
    if (this.filters.category) {
      params.category = this.filters.category;
    }
    if (this.filters.paymentMethod) {
      params.paymentMethod = this.filters.paymentMethod;
    }

    this.inventoryService.getRevenues(params).subscribe({
      next: (response) => {
        this.revenues = response.data.revenues;
        this.totalItems = response.data.pagination.total;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading revenues:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'خطأ في تحميل الإيرادات',
          life: 3000
        });
        this.loading = false;
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = (event.page || 0) + 1;
    this.pageSize = event.rows;
    this.loadRevenues();
  }

  applyFilters(): void {
    this.currentPage = 1;
    this.loadRevenues();
  }

  clearFilters(): void {
    this.filters = {
      startDate: null,
      endDate: null,
      category: '',
      paymentMethod: ''
    };
    this.currentPage = 1;
    this.loadRevenues();
  }

  recalculateRevenue(): void {
    this.recalculating = true;
    
    this.inventoryService.recalculateRevenue().subscribe({
      next: (response) => {
        this.messageService.add({
          severity: 'success',
          summary: 'نجح',
          detail: `تم إعادة حساب الإيرادات بنجاح. تمت معالجة ${response.processedCount} طلب`,
          life: 5000
        });
        this.recalculating = false;
        this.loadRevenues(); // Reload the data
      },
      error: (error) => {
        console.error('Error recalculating revenue:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'خطأ',
          detail: 'خطأ في إعادة حساب الإيرادات',
          life: 3000
        });
        this.recalculating = false;
      }
    });
  }

  getTotalRevenue(): number {
    return this.revenues.reduce((sum, revenue) => sum + revenue.amount, 0);
  }

  // Math utility for template
  get Math() {
    return Math;
  }
} 