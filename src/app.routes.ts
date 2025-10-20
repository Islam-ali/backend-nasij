import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            {
                path: '',
                redirectTo: 'orders',
                pathMatch: 'full'
            },
            { 
                path: 'brands', 
                loadComponent: () => import('./app/modules/brand/brand-list/brand-list.component').then(m => m.BrandListComponent)
            },
            { 
                path: 'categories', 
                loadComponent: () => import('./app/modules/category/catgory-list/catgory-list.component').then(m => m.CatgoryListComponent)
            },
            { 
                path: 'products', 
                loadComponent: () => import('./app/modules/product/product-list/product-list.component').then(m => m.ProductListComponent)
            },
            {
                path: 'packages',
                loadComponent: () => import('./app/modules/package/package-list/package-list.component').then(m => m.PackageListComponent)
            },
            {
                path: 'packages/:id',
                loadComponent: () => import('./app/modules/package/package-detail/package-detail.component').then(m => m.PackageDetailComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./app/modules/order/order-list/order-list.component').then(m => m.OrderListComponent)
            },
            {
                path: 'hero',
                loadComponent: () => import('./app/modules/hero/hero-list/hero-list.component').then(m => m.HeroListComponent)
            },
            {
                path: 'business-profile',
                loadComponent: () => import('./app/modules/business-profile/business-profile-list/business-profile-list.component').then(m => m.BusinessProfileListComponent)
            },
            {
                path: 'featured-collections',
                loadComponent: () => import('./app/modules/featured-collections/featured-collections-list/featured-collections-list.component').then(m => m.FeaturedCollectionsListComponent)
            },
            {
                path: 'banners',
                loadComponent: () => import('./app/modules/banner/banner-list/banner-list.component').then(m => m.BannerListComponent)
            },
            {
                path: 'features',
                loadComponent: () => import('./app/modules/feature/feature-list/feature-list.component').then(m => m.FeatureListComponent)
            },
            // {
            //     path: 'inventory',
            //     loadComponent: () => import('./app/modules/inventory/components/inventory-dashboard/inventory-dashboard.component').then(m => m.InventoryDashboardComponent)
            // },
            // {
            //     path: 'inventory/revenue-management',
            //     loadComponent: () => import('./app/modules/inventory/components/revenue-management/revenue-management.component').then(m => m.RevenueManagementComponent)
            // },
            // {
            //     path: 'inventory/stock',
            //     loadComponent: () => import('./app/modules/inventory/components/stock-management/stock-management.component').then(m => m.StockManagementComponent)
            // },
            // {
            //     path: 'inventory/expenses',
            //     loadComponent: () => import('./app/modules/inventory/components/expense-management/expense-management.component').then(m => m.ExpenseManagementComponent)
            // },
            // {
            //     path: 'inventory/reports',
            //     loadComponent: () => import('./app/modules/inventory/components/financial-reports/financial-reports.component').then(m => m.FinancialReportsComponent)
            // },
            // {
            //     path: 'inventory/stock-levels',
            //     loadComponent: () => import('./app/modules/inventory/components/stock-levels/stock-levels.component').then(m => m.StockLevelsComponent)
            // },
            // {
            //     path: 'inventory/quick-actions',
            //     loadComponent: () => import('./app/modules/inventory/components/quick-actions/quick-actions.component').then(m => m.QuickActionsComponent)
            // },
            {
                path: 'users',
                loadComponent: () => import('./app/modules/user/user-list/user-list.component').then(m => m.UserListComponent)
            },
            {
                path: 'users/:id',
                loadComponent: () => import('./app/modules/user/user-detail/user-detail.component').then(m => m.UserDetailComponent)
            },
            {
                path: 'locations',
                loadChildren: () => import('./app/modules/location/location.module').then(m => m.LocationModule)
            }
        ]
    },
    // { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/auth/auth2.routes') },
    { path: '**', redirectTo: '/notfound' }
];
