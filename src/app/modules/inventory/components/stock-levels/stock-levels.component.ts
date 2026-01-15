import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InventoryService, StockLevel, BaseResponse } from '../../../../services/inventory.service';

@Component({
  selector: 'app-stock-levels',
  templateUrl: './stock-levels.component.html',
  styleUrls: ['./stock-levels.component.scss'],
  standalone: true,
  imports: [CommonModule]
})
export class StockLevelsComponent implements OnInit {
  stockLevels: StockLevel[] = [];
  loading = false;

  constructor(private inventoryService: InventoryService) {}

  ngOnInit(): void {
    this.loadStockLevels();
  }

  loadStockLevels(): void {
    this.loading = true;
    this.inventoryService.getCurrentStockLevels().subscribe({
      next: (response: BaseResponse<StockLevel[]>) => {
        this.stockLevels = response.data ?? [];
        this.loading = false;
      },
      error: (error) => {
        this.loading = false;
      }
    });
  }

  getStockStatusColor(stock: number): string {
    if (stock === 0) return '#e74c3c';
    if (stock <= 10) return '#f39c12';
    return '#27ae60';
  }

  getStockStatusText(stock: number): string {
    if (stock === 0) return 'نفذ المخزون';
    if (stock <= 10) return 'منخفض';
    return 'متوفر';
  }
} 