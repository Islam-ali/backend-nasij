import { Component, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

// PrimeNG Modules
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { TableModule } from 'primeng/table';
import { Skeleton } from "primeng/skeleton";
import { DividerModule } from 'primeng/divider';
import { PanelModule } from 'primeng/panel';

import { IPackage, IPackageInventorySummary } from '../../../interfaces/package.interface';
import { PackageService } from '../../../services/package.service';
import { BaseResponse } from '../../../core/models/baseResponse';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { finalize, takeUntil } from 'rxjs';

@Component({
    selector: 'app-package-detail',
    templateUrl: './package-detail.component.html',
    styleUrls: ['./package-detail.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        CardModule,
        ButtonModule,
        TagModule,
        TableModule,
        Skeleton,
        DividerModule,
        PanelModule,
        RouterLink  
    ],
    providers: [PackageService]
})
export class PackageDetailComponent extends ComponentBase implements OnInit {
    @Input() packageId?: string;
    
    package = signal<IPackage>({} as IPackage);
    inventorySummary = signal<IPackageInventorySummary>({} as IPackageInventorySummary);
    loading = signal(false);
    loadingInventory = signal(false);

    constructor(
        private packageService: PackageService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        super();
    }

    ngOnInit() {
        if (!this.packageId) {
            this.packageId = this.route.snapshot.paramMap.get('id') || '';
        }
        
        if (this.packageId) {
            this.loadPackage();
            this.loadInventorySummary();
        }
    }

    loadPackage() {
        this.loading.set(true);
        this.packageService.getPackage(this.packageId!)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<IPackage>) => {
                    if (response.success) {
                        this.package.set(response.data);
                    }
                },
                error: (error) => {
                    console.error('Failed to load package:', error);
                }
            });
    }

    loadInventorySummary() {
        this.loadingInventory.set(true);
        this.packageService.getInventorySummary(this.packageId!)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loadingInventory.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<IPackageInventorySummary>) => {
                    if (response.success) {
                        this.inventorySummary.set(response.data);
                    }
                },
                error: (error) => {
                    console.error('Failed to load inventory summary:', error);
                }
            });
    }

    editPackage() {
        this.router.navigate(['/packages/edit', this.packageId]);
    }

    getStatusSeverity(isActive: boolean): string {
        return isActive ? 'success' : 'danger';
    }

    getStatusLabel(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }

    getStockSeverity(stock: number): string {
        if (stock === 0) return 'danger';
        if (stock < 10) return 'warn';
        return 'success';
    }

    getStockLabel(stock: number): string {
        if (stock === 0) return 'Out of Stock';
        if (stock < 10) return 'Low Stock';
        return 'In Stock';
    }

    getDiscountPercentage(price: number, discountPrice?: number): number {
        if (!discountPrice || discountPrice >= price) return 0;
        return Math.round(((price - discountPrice) / price) * 100);
    }

    getMainImage(): string {
        const packageItem = this.package();
        if (packageItem.images && packageItem.images.length > 0) {
            return packageItem.images[0];
        }
        return '';
    }

    getImages(): string[] {
        const packageItem = this.package();
        return packageItem.images || [];
    }

    getTags(): string[] {
        const packageItem = this.package();
        return packageItem.tags || [];
    }

    getItemsCount(): number {
        const packageItem = this.package();
        return packageItem.items?.length || 0;
    }

    getTotalValue(): number {
        const packageItem = this.package();
        return packageItem.price || 0;
    }

    getDiscountedValue(): number {
        const packageItem = this.package();
        return packageItem.discountPrice || packageItem.price || 0;
    }

    getSavings(): number {
        const packageItem = this.package();
        if (!packageItem.discountPrice) return 0;
        return packageItem.price - packageItem.discountPrice;
    }
} 