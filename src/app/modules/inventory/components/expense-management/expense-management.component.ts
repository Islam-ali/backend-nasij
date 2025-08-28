import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InventoryService, Expense } from '../../../../services/inventory.service';
import { BaseResponse } from '../../../../core/models/baseResponse';

@Component({
  selector: 'app-expense-management',
  templateUrl: './expense-management.component.html',
  styleUrls: ['./expense-management.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class ExpenseManagementComponent implements OnInit {
  expenses: Expense[] = [];
  loading = false;
  showAddForm = false;
  showEditForm = false;
  selectedExpense: Expense | null = null;
  
  // Forms
  expenseForm!: FormGroup;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  // Filters
  selectedCategory = '';
  selectedPaymentMethod = '';
  selectedStatus = '';
  startDate = '';
  endDate = '';

  // Categories and payment methods
  categories = [
    { value: 'RENT', label: 'إيجار' },
    { value: 'UTILITIES', label: 'مرافق' },
    { value: 'SALARY', label: 'رواتب' },
    { value: 'MARKETING', label: 'تسويق' },
    { value: 'INVENTORY', label: 'مخزون' },
    { value: 'SHIPPING', label: 'شحن' },
    { value: 'MAINTENANCE', label: 'صيانة' },
    { value: 'INSURANCE', label: 'تأمين' },
    { value: 'TAXES', label: 'ضرائب' },
    { value: 'OFFICE_SUPPLIES', label: 'مستلزمات مكتبية' },
    { value: 'TRAVEL', label: 'سفر' },
    { value: 'PROFESSIONAL_SERVICES', label: 'خدمات مهنية' },
    { value: 'OTHER', label: 'أخرى' }
  ];

  paymentMethods = [
    { value: 'CASH', label: 'نقداً' },
    { value: 'BANK_TRANSFER', label: 'تحويل بنكي' },
    { value: 'CREDIT_CARD', label: 'بطاقة ائتمان' },
    { value: 'CHECK', label: 'شيك' },
    { value: 'DIGITAL_PAYMENT', label: 'دفع إلكتروني' }
  ];

  statusOptions = [
    { value: 'PENDING', label: 'في الانتظار' },
    { value: 'APPROVED', label: 'معتمد' },
    { value: 'REJECTED', label: 'مرفوض' },
    { value: 'PAID', label: 'مدفوع' }
  ];

  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder
  ) {
    this.initForm();
  }

  ngOnInit(): void {
    this.loadExpenses();
  }

  initForm(): void {
    this.expenseForm = this.fb.group({
      title: ['', Validators.required],
      description: [''],
      amount: [0, [Validators.required, Validators.min(0.01)]],
      category: ['', Validators.required],
      paymentMethod: ['', Validators.required],
      expenseDate: ['', Validators.required],
      receiptNumber: [''],
      vendor: [''],
      isRecurring: [false],
      recurringPeriod: [''],
      nextDueDate: [''],
      status: ['PENDING'], // إضافة حقل الحالة
      notes: ['']
    });
  }

  loadExpenses(): void {
    this.loading = true;
    const query: any = {
      page: this.currentPage,
      limit: this.itemsPerPage
    };

    // إضافة المعاملات فقط إذا كانت لها قيم صحيحة
    if (this.selectedCategory && this.selectedCategory.trim() !== '') {
      query.category = this.selectedCategory;
    }
    
    if (this.selectedPaymentMethod && this.selectedPaymentMethod.trim() !== '') {
      query.paymentMethod = this.selectedPaymentMethod;
    }
    
    if (this.selectedStatus && this.selectedStatus.trim() !== '') {
      if (this.selectedStatus === 'approved') {
        query.status = 'APPROVED';
      } else if (this.selectedStatus === 'pending') {
        query.status = 'PENDING';
      } else if (this.selectedStatus === 'rejected') {
        query.status = 'REJECTED';
      } else if (this.selectedStatus === 'paid') {
        query.status = 'PAID';
      }
    }
    
    if (this.startDate && this.startDate.trim() !== '') {
      query.startDate = new Date(this.startDate);
    }
    
    if (this.endDate && this.endDate.trim() !== '') {
      query.endDate = new Date(this.endDate);
    }

    this.inventoryService.getExpenses(query).subscribe({
      next: (response: BaseResponse<{ expenses: Expense[]; pagination: any }>) => {
        this.expenses = response.data?.expenses ?? [];
        this.totalPages = response.data?.pagination?.pages ?? 1;
        this.totalItems = response.data?.pagination?.total ?? 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading expenses:', error);
        this.loading = false;
      }
    });
  }

  getTotalExpenses(): number {
    return this.expenses?.reduce((sum, exp) => sum + exp.amount, 0) ?? 0;
  }

  getTotalPendingExpenses(): number {
    return this.expenses?.filter(exp => exp.status === 'PENDING').reduce((sum, exp) => sum + exp.amount, 0) ?? 0;
  }

  getTotalApprovedExpenses(): number {
    return this.expenses?.filter(exp => exp.status === 'APPROVED').reduce((sum, exp) => sum + exp.amount, 0) ?? 0;
  }

  getTotalRecurringExpenses(): number {
    return this.expenses?.filter(exp => exp.isRecurring).reduce((sum, exp) => sum + exp.amount, 0) ?? 0;
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadExpenses();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadExpenses();
  }

  clearFilters(): void {
    this.selectedCategory = '';
    this.selectedPaymentMethod = '';
    this.selectedStatus = '';
    this.startDate = '';
    this.endDate = '';
    this.onFilterChange();
  }

  showAddExpenseForm(): void {
    this.showAddForm = true;
    this.showEditForm = false;
    this.selectedExpense = null;
    this.expenseForm.reset();
    this.expenseForm.patchValue({
      expenseDate: new Date().toISOString().split('T')[0],
      isRecurring: false,
      status: 'PENDING' // تعيين الحالة الافتراضية
    });
  }

  showEditExpenseForm(expense: Expense): void {
    this.showEditForm = true;
    this.showAddForm = false;
    this.selectedExpense = expense;
    this.expenseForm.patchValue({
      title: expense.title,
      description: expense.description,
      amount: expense.amount,
      category: expense.category,
      paymentMethod: expense.paymentMethod,
      expenseDate: new Date(expense.expenseDate).toISOString().split('T')[0],
      receiptNumber: expense.receiptNumber,
      vendor: expense.vendor,
      isRecurring: expense.isRecurring,
      recurringPeriod: expense.recurringPeriod,
      nextDueDate: expense.nextDueDate ? new Date(expense.nextDueDate).toISOString().split('T')[0] : '',
      status: expense.status || 'PENDING', // إضافة الحالة
      notes: expense.notes
    });
  }

  hideForms(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.selectedExpense = null;
    this.expenseForm.reset();
  }

  saveExpense(): void {
    if (this.expenseForm.valid) {
      const formData = { ...this.expenseForm.value };
      
      // تحويل التواريخ من string إلى Date
      if (formData.expenseDate) {
        formData.expenseDate = new Date(formData.expenseDate);
      }
      
      if (formData.nextDueDate && formData.nextDueDate.trim() !== '') {
        formData.nextDueDate = new Date(formData.nextDueDate);
      } else {
        delete formData.nextDueDate; // إزالة إذا كان فارغاً
      }
      
      // إرسال status في كل من الإنشاء والتعديل
      if (this.showAddForm) {
        this.inventoryService.createExpense(formData).subscribe({
          next: () => {
            this.hideForms();
            this.loadExpenses();
          },
          error: (error) => {
            console.error('Error creating expense:', error);
          }
        });
      } else if (this.showEditForm && this.selectedExpense) {
        this.inventoryService.updateExpense(this.selectedExpense.id || this.selectedExpense._id!, formData).subscribe({
          next: () => {
            this.hideForms();
            this.loadExpenses();
          },
          error: (error) => {
            console.error('Error updating expense:', error);
          }
        });
      }
    }
  }

  deleteExpense(expense: Expense): void {
    if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
      this.inventoryService.deleteExpense(expense.id || expense._id!).subscribe({
        next: () => {
          this.loadExpenses();
        },
        error: (error) => {
          console.error('Error deleting expense:', error);
        }
      });
    }
  }

  getCategoryLabel(value: string): string {
    const category = this.categories.find(c => c.value === value);
    return category ? category.label : value;
  }

  getPaymentMethodLabel(value: string): string {
    const method = this.paymentMethods.find(m => m.value === value);
    return method ? method.label : value;
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
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

  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED':
        return '#27ae60';
      case 'PENDING':
        return '#f39c12';
      case 'REJECTED':
        return '#e74c3c';
      case 'PAID':
        return '#3498db';
      default:
        return '#95a5a6';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED':
        return 'معتمد';
      case 'PENDING':
        return 'في الانتظار';
      case 'REJECTED':
        return 'مرفوض';
      case 'PAID':
        return 'مدفوع';
      default:
        return status;
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxPages = Math.min(5, this.totalPages);
    const startPage = Math.max(1, this.currentPage - Math.floor(maxPages / 2));
    const endPage = Math.min(this.totalPages, startPage + maxPages - 1);
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  onRecurringChange(): void {
    const isRecurring = this.expenseForm.get('isRecurring')?.value;
    if (!isRecurring) {
      this.expenseForm.patchValue({
        recurringPeriod: '',
        nextDueDate: ''
      });
    }
  }
} 