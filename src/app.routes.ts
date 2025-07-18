import { Routes } from '@angular/router';
import { AppLayout } from './app/layout/component/app.layout';
import { Dashboard } from './app/pages/dashboard/dashboard';
import { Documentation } from './app/pages/documentation/documentation';
import { Landing } from './app/pages/landing/landing';
import { Notfound } from './app/pages/notfound/notfound';
import { ProductListComponent } from './app/modules/product/product-list/product-list.component';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', component: Dashboard },
            { path: 'uikit', loadChildren: () => import('./app/pages/uikit/uikit.routes') },
            { path: 'documentation', component: Documentation },
            { path: 'pages', loadChildren: () => import('./app/pages/pages.routes') },
            { 
                path: 'products', 
                loadComponent: () => import('./app/modules/product/product-list/product-list.component').then(m => m.ProductListComponent)
            },
            { 
                path: 'categories', 
                loadComponent: () => import('./app/modules/category/catgory-list/catgory-list.component').then(m => m.CatgoryListComponent)
            },
            { 
                path: 'brands', 
                loadComponent: () => import('./app/modules/brand/brand-list/brand-list.component').then(m => m.BrandListComponent)
            },
            {
                path: 'orders',
                loadComponent: () => import('./app/modules/order/order-list/order-list.component').then(m => m.OrderListComponent)
            }
        ]
    },
    { path: 'landing', component: Landing },
    { path: 'notfound', component: Notfound },
    { path: 'auth', loadChildren: () => import('./app/auth/auth2.routes') },
    { path: '**', redirectTo: '/notfound' }
];
