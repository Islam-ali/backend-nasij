import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { InventoryService, StockMovement, StockLevel } from '../../../../services/inventory.service';
import { BaseResponse } from '../../../../core/models/baseResponse';

@Component({
  selector: 'app-stock-management',
  templateUrl: './stock-management.component.html',
  styleUrls: ['./stock-management.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule]
})
export class StockManagementComponent implements OnInit {
  stockMovements: StockMovement[] = [];
  stockLevels: StockLevel[] = [];
  lowStockAlerts: StockLevel[] = [];
  loading = false;
  showAddForm = false;
  showAdjustForm = false;
  
  // Forms
  addStockForm!: FormGroup;
  adjustStockForm!: FormGroup;
  
  // Pagination
  currentPage = 1;
  totalPages = 1;
  totalItems = 0;
  itemsPerPage = 10;

  // Filters
  selectedProduct = '';
  selectedMovementType = '';
  selectedReason = '';
  startDate = '';
  endDate = '';

  constructor(
    private inventoryService: InventoryService,
    private fb: FormBuilder
  ) {
    this.initForms();
  }

  ngOnInit(): void {
    this.loadStockMovements();
    this.loadStockLevels();
    this.loadLowStockAlerts();
  }

  initForms(): void {
    this.addStockForm = this.fb.group({
      productId: ['', Validators.required],
      quantity: [0, [Validators.required, Validators.min(1)]],
      unitCost: [0, [Validators.required, Validators.min(0)]],
      notes: ['']
    });

    this.adjustStockForm = this.fb.group({
      productId: ['', Validators.required],
      newStock: [0, [Validators.required, Validators.min(0)]],
      reason: ['', Validators.required]
    });
  }

  loadStockMovements(): void {
    this.loading = true;
    const query = {
      page: this.currentPage,
      limit: this.itemsPerPage,
      productId: this.selectedProduct || undefined,
      movementType: this.selectedMovementType || undefined,
      reason: this.selectedReason || undefined,
      startDate: this.startDate ? new Date(this.startDate) : undefined,
      endDate: this.endDate ? new Date(this.endDate) : undefined
    };

    this.inventoryService.getStockMovements(query).subscribe({
      next: (response: BaseResponse<{ movements: StockMovement[]; pagination: any }>) => {
        this.stockMovements = response.data.movements;
        this.totalPages = response.data.pagination?.pages ?? 1;
        this.totalItems = response.data.pagination?.total ?? 0;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading stock movements:', error);
        this.loading = false;
      }
    });
  }

  loadStockLevels(): void {
    this.inventoryService.getCurrentStockLevels().subscribe({
      next: (response: BaseResponse<StockLevel[]>) => {
        this.stockLevels = response.data ?? [];
      },
      error: (error) => {
        console.error('Error loading stock levels:', error);
      }
    });
  }

  loadLowStockAlerts(): void {
    this.inventoryService.getLowStockAlerts(10).subscribe({
      next: (alerts) => {
        this.lowStockAlerts = alerts;
      },
      error: (error) => {
        console.error('Error loading low stock alerts:', error);
      }
    });
  }

  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadStockMovements();
  }

  onFilterChange(): void {
    this.currentPage = 1;
    this.loadStockMovements();
  }

  clearFilters(): void {
    this.selectedProduct = '';
    this.selectedMovementType = '';
    this.selectedReason = '';
    this.startDate = '';
    this.endDate = '';
    this.onFilterChange();
  }

  showAddStockForm(): void {
    this.showAddForm = true;
    this.showAdjustForm = false;
  }

  showAdjustStockForm(): void {
    this.showAdjustForm = true;
    this.showAddForm = false;
  }

  hideForms(): void {
    this.showAddForm = false;
    this.showAdjustForm = false;
    this.addStockForm.reset();
    this.adjustStockForm.reset();
  }

  addStock(): void {
    if (this.addStockForm.valid) {
      const formData = this.addStockForm.value;
      this.inventoryService.quickAddStock(formData).subscribe({
        next: () => {
          this.hideForms();
          this.loadStockMovements();
          this.loadStockLevels();
          this.loadLowStockAlerts();
        },
        error: (error) => {
          console.error('Error adding stock:', error);
        }
      });
    }
  }

  adjustStock(): void {
    if (this.adjustStockForm.valid) {
      const formData = this.adjustStockForm.value;
      this.inventoryService.quickAdjustStock(formData).subscribe({
        next: () => {
          this.hideForms();
          this.loadStockMovements();
          this.loadStockLevels();
          this.loadLowStockAlerts();
        },
        error: (error) => {
          console.error('Error adjusting stock:', error);
        }
      });
    }
  }

  getMovementTypeColor(type: string): string {
    const colors: { [key: string]: string } = {
      'IN': '#4CAF50',
      'OUT': '#F44336',
      'SALE': '#FF9800',
      'RETURN': '#2196F3',
      'ADJUSTMENT': '#9C27B0',
      'DAMAGED': '#795548',
      'EXPIRED': '#607D8B'
    };
    return colors[type] || '#757575';
  }

  getStockStatusColor(stock: number): string {
    if (stock === 0) return '#F44336';
    if (stock <= 10) return '#FF9800';
    return '#4CAF50';
  }

  getStockStatusText(stock: number): string {
    if (stock === 0) return 'نفذ المخزون';
    if (stock <= 10) return 'منخفض';
    return 'متوفر';
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
} 