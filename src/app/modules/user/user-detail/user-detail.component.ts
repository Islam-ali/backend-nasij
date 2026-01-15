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
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';

import { User, UserRole } from '../../../interfaces/user.interface';
import { UsersService } from '../../../services/users.service';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { BaseResponse } from '../../../core/models/baseResponse';
import { finalize, takeUntil } from 'rxjs';

@Component({
    selector: 'app-user-detail',
    templateUrl: './user-detail.component.html',
    styleUrls: ['./user-detail.component.scss'],
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
        TabViewModule,
        CalendarModule,
        RouterLink
    ],
    providers: [UsersService]
})
export class UserDetailComponent extends ComponentBase implements OnInit {
    @Input() userId?: string;
    
    user = signal<User>({} as User);
    loading = signal(false);
    activeTabIndex = 0;

    constructor(
        private usersService: UsersService,
        private route: ActivatedRoute,
        private router: Router
    ) {
        super();
    }

    ngOnInit() {
        if (!this.userId) {
            this.userId = this.route.snapshot.paramMap.get('id') || '';
        }
        
        if (this.userId) {
            this.loadUser();
        }
    }

    loadUser() {
        this.loading.set(true);
        this.usersService.getUser(this.userId!)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<User>) => {
                    if (response.success) {
                        this.user.set(response.data);
                    }
                },
                error: (error) => {
                }
            });
    }

    // editUser() {
    //     this.router.navigate(['/users/edit', this.userId]);
    // }

    getStatusSeverity(isActive: boolean): string {
        return isActive ? 'success' : 'danger';
    }

    getStatusLabel(isActive: boolean): string {
        return isActive ? 'Active' : 'Inactive';
    }

    getRoleSeverity(role: string): string {
        switch (role) {
            case UserRole.ADMIN:
                return 'danger';
            case UserRole.MANAGER:
                return 'warning';
            case UserRole.CUSTOMER:
                return 'info';
            default:
                return 'info';
        }
    }

    getRoleLabel(role: string): string {
        return role.charAt(0).toUpperCase() + role.slice(1);
    }

    getAvatarInitial(name: string): string {
        return name ? name.charAt(0).toUpperCase() : 'U';
    }

    getAddressesCount(addresses: any[]): number {
        return addresses?.length || 0;
    }

    getDefaultAddress(addresses: any[]): any {
        return addresses?.find(addr => addr.isDefault) || addresses?.[0];
    }

    getFormattedAddress(address: any): string {
        if (!address) return 'No address';
        return `${address.address}, ${address.city}, ${address.state} ${address.zipCode}, ${address.country}`;
    }

    getLastLoginFormatted(lastLogin?: Date): string {
        if (!lastLogin) return 'Never';
        const now = new Date();
        const diffInMs = now.getTime() - new Date(lastLogin).getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return 'Yesterday';
        if (diffInDays < 7) return `${diffInDays} days ago`;
        if (diffInDays < 30) return `${Math.floor(diffInDays / 7)} weeks ago`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months ago`;
        return `${Math.floor(diffInDays / 365)} years ago`;
    }

    getAccountAge(createdAt?: Date): string {
        if (!createdAt) return 'Unknown';
        const now = new Date();
        const diffInMs = now.getTime() - new Date(createdAt).getTime();
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
        
        if (diffInDays === 0) return 'Today';
        if (diffInDays === 1) return '1 day';
        if (diffInDays < 30) return `${diffInDays} days`;
        if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} months`;
        return `${Math.floor(diffInDays / 365)} years`;
    }

    getLanguageLabel(language: string): string {
        switch (language) {
            case 'en': return 'English';
            case 'ar': return 'Arabic';
            default: return language;
        }
    }

    getTimezoneLabel(timezone: string): string {
        switch (timezone) {
            case 'UTC': return 'UTC (Coordinated Universal Time)';
            case 'GMT+3': return 'GMT+3 (Eastern European Time)';
            default: return timezone;
        }
    }

    getNotificationStatus(notifications: boolean): string {
        return notifications ? 'Enabled' : 'Disabled';
    }

    getNotificationSeverity(notifications: boolean): string {
        return notifications ? 'success' : 'warning';
    }

    onTabChange(event: any) {
        this.activeTabIndex = event.index;
    }
} 