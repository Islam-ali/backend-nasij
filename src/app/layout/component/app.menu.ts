import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MenuItem } from 'primeng/api';
import { AppMenuitem } from './app.menuitem';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-menu',
    standalone: true,
    imports: [CommonModule, AppMenuitem, RouterModule, TranslateModule],
    template: `<ul class="layout-menu">
        <ng-container *ngFor="let item of model; let i = index">
            <li app-menuitem *ngIf="!item.separator" [item]="item" [index]="i" [root]="true"></li>
            <li *ngIf="item.separator" class="menu-separator"></li>
        </ng-container>
    </ul> `
})
export class AppMenu implements OnInit {
    model: MenuItem[] = [];

    constructor(
        private translate: TranslateService,
        @Inject(PLATFORM_ID) private platformId: Object
    ) {}

    ngOnInit() {
        this.updateMenu();
        this.translate.onLangChange.subscribe(() => {
            this.updateMenu();
        });
    }

    private updateMenu() {
        this.model = [
            {
                label: this.translate.instant('navigation.home'),
                items: [{ label: this.translate.instant('navigation.dashboard'), icon: 'pi pi-fw pi-home', routerLink: ['/'] }]
            },
            { separator: true },
            {
                label: this.translate.instant('navigation.storeSetup'),
                items: [
                    { label: this.translate.instant('navigation.businessProfile'), icon: 'pi pi-fw pi-briefcase', routerLink: ['/business-profile'] },
                    { label: this.translate.instant('navigation.menuLinks'), icon: 'pi pi-fw pi-link', routerLink: ['/menu-links'] },
                    { label: this.translate.instant('navigation.heroSections'), icon: 'pi pi-fw pi-image', routerLink: ['/hero'] },
                    { label: this.translate.instant('navigation.featuredCollections'), icon: 'pi pi-fw pi-star', routerLink: ['/featured-collections'] },
                    { label: this.translate.instant('navigation.heroLayouts'), icon: 'pi pi-fw pi-th-large', routerLink: ['/hero-layouts'] },
                    { label: this.translate.instant('navigation.productFeatures'), icon: 'pi pi-fw pi-sliders-h', routerLink: ['/product-features'] },
                    { label: this.translate.instant('navigation.banners'), icon: 'pi pi-fw pi-megaphone', routerLink: ['/banners'] },
                    { label: this.translate.instant('navigation.features'), icon: 'pi pi-fw pi-sliders-h', routerLink: ['/features'] },
                    { label: this.translate.instant('navigation.reviews'), icon: 'pi pi-fw pi-star', routerLink: ['/reviews'] }
                ]
            },
            {
                label: this.translate.instant('navigation.catalog'),
                items: [
                    { label: this.translate.instant('navigation.brands'), icon: 'pi pi-fw pi-tags', routerLink: ['/brands'] },
                    { label: this.translate.instant('navigation.categories'), icon: 'pi pi-fw pi-th-large', routerLink: ['/categories'] },
                    { label: this.translate.instant('navigation.products'), icon: 'pi pi-fw pi-box', routerLink: ['/products'] },
                    { label: this.translate.instant('navigation.packages'), icon: 'pi pi-fw pi-shopping-bag', routerLink: ['/packages'] }
                ]
            },
            {
                label: this.translate.instant('navigation.sales'),
                items: [
                    { label: this.translate.instant('navigation.orders'), icon: 'pi pi-fw pi-shopping-cart', routerLink: ['/orders'] }
                    // Future: inventory, revenue, etc.
                ]
            },
            {
                label: this.translate.instant('navigation.customers'),
                items: [
                    { label: this.translate.instant('navigation.users'), icon: 'pi pi-fw pi-users', routerLink: ['/users'] }
                ]
            },
            {
                label: this.translate.instant('navigation.locations'),
                items: [
                    {
                        label: this.translate.instant('navigation.manageLocations'),
                        icon: 'pi pi-fw pi-globe',
                        items: [
                            { label: this.translate.instant('navigation.countries'), icon: 'pi pi-fw pi-globe', routerLink: ['/locations/countries'] },
                            { label: this.translate.instant('navigation.states'), icon: 'pi pi-fw pi-map', routerLink: ['/locations/states'] }
                        ]
                    }
                ]
            },
            // {
            //     label: 'UI Components',
            //     items: [
            //         { label: 'Form Layout', icon: 'pi pi-fw pi-id-card', routerLink: ['/uikit/formlayout'] },
            //         { label: 'Input', icon: 'pi pi-fw pi-check-square', routerLink: ['/uikit/input'] },
            //         { label: 'Button', icon: 'pi pi-fw pi-mobile', class: 'rotated-icon', routerLink: ['/uikit/button'] },
            //         { label: 'Table', icon: 'pi pi-fw pi-table', routerLink: ['/uikit/table'] },
            //         { label: 'List', icon: 'pi pi-fw pi-list', routerLink: ['/uikit/list'] },
            //         { label: 'Tree', icon: 'pi pi-fw pi-share-alt', routerLink: ['/uikit/tree'] },
            //         { label: 'Panel', icon: 'pi pi-fw pi-tablet', routerLink: ['/uikit/panel'] },
            //         { label: 'Overlay', icon: 'pi pi-fw pi-clone', routerLink: ['/uikit/overlay'] },
            //         { label: 'Media', icon: 'pi pi-fw pi-image', routerLink: ['/uikit/media'] },
            //         { label: 'Menu', icon: 'pi pi-fw pi-bars', routerLink: ['/uikit/menu'] },
            //         { label: 'Message', icon: 'pi pi-fw pi-comment', routerLink: ['/uikit/message'] },
            //         { label: 'File', icon: 'pi pi-fw pi-file', routerLink: ['/uikit/file'] },
            //         { label: 'Chart', icon: 'pi pi-fw pi-chart-bar', routerLink: ['/uikit/charts'] },
            //         { label: 'Timeline', icon: 'pi pi-fw pi-calendar', routerLink: ['/uikit/timeline'] },
            //         { label: 'Misc', icon: 'pi pi-fw pi-circle', routerLink: ['/uikit/misc'] }
            //     ]
            // },
            // {
            //     label: 'Pages',
            //     icon: 'pi pi-fw pi-briefcase',
            //     routerLink: ['/pages'],
            //     items: [
            //         {
            //             label: 'Landing',
            //             icon: 'pi pi-fw pi-globe',
            //             routerLink: ['/landing']
            //         },
            //         {
            //             label: 'Auth',
            //             icon: 'pi pi-fw pi-user',
            //             items: [
            //                 {
            //                     label: 'Login',
            //                     icon: 'pi pi-fw pi-sign-in',
            //                     routerLink: ['/auth/login']
            //                 },
            //                 {
            //                     label: 'Error',
            //                     icon: 'pi pi-fw pi-times-circle',
            //                     routerLink: ['/auth/error']
            //                 },
            //                 {
            //                     label: 'Access Denied',
            //                     icon: 'pi pi-fw pi-lock',
            //                     routerLink: ['/auth/access']
            //                 }
            //             ]
            //         },
            //         {
            //             label: 'Crud',
            //             icon: 'pi pi-fw pi-pencil',
            //             routerLink: ['/pages/crud']
            //         },
            //         {
            //             label: 'Not Found',
            //             icon: 'pi pi-fw pi-exclamation-circle',
            //             routerLink: ['/pages/notfound']
            //         },
            //         {
            //             label: 'Empty',
            //             icon: 'pi pi-fw pi-circle-off',
            //             routerLink: ['/pages/empty']
            //         }
            //     ]
            // },
            // {
            //     label: 'Hierarchy',
            //     items: [
            //         {
            //             label: 'Submenu 1',
            //             icon: 'pi pi-fw pi-bookmark',
            //             items: [
            //                 {
            //                     label: 'Submenu 1.1',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 1.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.2', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 1.1.3', icon: 'pi pi-fw pi-bookmark' }
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 1.2',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [{ label: 'Submenu 1.2.1', icon: 'pi pi-fw pi-bookmark' }]
            //                 }
            //             ]
            //         },
            //         {
            //             label: 'Submenu 2',
            //             icon: 'pi pi-fw pi-bookmark',
            //             items: [
            //                 {
            //                     label: 'Submenu 2.1',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [
            //                         { label: 'Submenu 2.1.1', icon: 'pi pi-fw pi-bookmark' },
            //                         { label: 'Submenu 2.1.2', icon: 'pi pi-fw pi-bookmark' }
            //                     ]
            //                 },
            //                 {
            //                     label: 'Submenu 2.2',
            //                     icon: 'pi pi-fw pi-bookmark',
            //                     items: [{ label: 'Submenu 2.2.1', icon: 'pi pi-fw pi-bookmark' }]
            //                 }
            //             ]
            //         }
            //     ]
            // },
            // {
            //     label: 'Get Started',
            //     items: [
            //         {
            //             label: 'Documentation',
            //             icon: 'pi pi-fw pi-book',
            //             routerLink: ['/documentation']
            //         },
            //         {
            //             label: 'View Source',
            //             icon: 'pi pi-fw pi-github',
            //             url: 'https://github.com/primefaces/sakai-ng',
            //             target: '_blank'
            //         }
            //     ]
            // }
        ];
    }
}
