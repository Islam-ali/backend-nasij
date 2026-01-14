import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray, FormsModule } from '@angular/forms';

// PrimeNG Services
import { ConfirmationService, MessageService } from 'primeng/api';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

// PrimeNG Modules
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';
import { DialogModule } from 'primeng/dialog';
import { TagModule } from 'primeng/tag';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { TextareaModule } from 'primeng/textarea';
import { CardModule } from 'primeng/card';
import { ToggleSwitchModule } from "primeng/toggleswitch";
import { Skeleton } from "primeng/skeleton";
import { MultiSelectModule } from 'primeng/multiselect';
import { CalendarModule } from 'primeng/calendar';

import { User, UserRole, CreateUserDto, UpdateUserDto, UserFilters, Address } from '../../../interfaces/user.interface';
import { UsersService } from '../../../services/users.service';
import { ComponentBase } from '../../../core/directives/component-base.directive';
import { BaseResponse } from '../../../core/models/baseResponse';
import { finalize, takeUntil } from 'rxjs';
import { RouterModule } from '@angular/router';
import { TooltipModule } from 'primeng/tooltip';

interface Column {
    field: string;
    header: string;
    customExportHeader?: string;
}

@Component({
    selector: 'app-user-list',
    templateUrl: './user-list.component.html',
    styleUrls: ['./user-list.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        RippleModule,
        ToastModule,
        ToolbarModule,
        InputTextModule,
        DropdownModule,
        DialogModule,
        TagModule,
        InputIconModule,
        IconFieldModule,
        ConfirmDialogModule,
        FormsModule,
        TextareaModule,
        CardModule,
        ToggleSwitchModule,
        Skeleton,
        MultiSelectModule,
        CalendarModule,
        RouterModule,
        TranslateModule,
        TooltipModule
    ],
    providers: [MessageService, ConfirmationService, UsersService]
})
export class UserListComponent extends ComponentBase implements OnInit {
    @ViewChild('dt') dt!: Table;

    users = signal<User[]>([]);
    loading = signal(false);
    selectedUsers = signal<User[]>([]);
    userDialog = false;
    deleteUserDialog = false;
    deleteUsersDialog = false;
    user = signal<User>({} as User);
    submitted = signal(false);
    isEdit = signal(false);
    showPassword = signal(false);

    cols!: Column[];
    exportColumns!: Column[];
    roles: any[] = [];
    
    currentPage = 1;
    itemsPerPage = 10;
    totalItems = 0;

    userForm!: FormGroup;
    filters: UserFilters = {
        search: '',
        role: undefined,
        isActive: undefined,
        page: 1,
        limit: 10
    };

    constructor(
        private usersService: UsersService,
        private messageService: MessageService,
        private confirmationService: ConfirmationService,
        private fb: FormBuilder,
        private translate: TranslateService
    ) {
        super();
    }

    ngOnInit() {
        this.initializeColumns();
        this.initializeForm();
        this.loadUsers();
        this.roles = Object.values(UserRole).map(role => ({
            label: this.translate.instant(`user.roles.${role}`) || role,
            value: role
        }));
    }
    initializeColumns() {
        this.cols = [
            { field: 'name', header: this.translate.instant('common.name') },
            { field: 'email', header: this.translate.instant('common.email') },
            { field: 'role', header: this.translate.instant('user.role') },
            { field: 'isActive', header: this.translate.instant('common.status') },
            { field: 'lastLogin', header: this.translate.instant('user.lastLogin') },
            { field: 'createdAt', header: this.translate.instant('user.createdDate') }
        ];

        this.exportColumns = this.cols.map(col => ({ title: col.header, dataKey: col.field })) as unknown as Column[];
    }

    initializeForm() {
        this.userForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            email: ['', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
            role: [UserRole.CUSTOMER, Validators.required],
            phone: [''],
            isActive: [true],
            addresses: this.fb.array([]),
            preferences: this.fb.group({
                language: ['en'],
                timezone: ['UTC'],
                notifications: [true]
            })
        });
    }

    get addresses() {
        return this.userForm.get('addresses') as FormArray;
    }

    get preferences() {
        return this.userForm.get('preferences') as FormGroup;
    }

    addAddress() {
        const addressGroup = this.fb.group({
            address: ['', Validators.required],
            city: ['', Validators.required],
            state: ['', Validators.required],
            zipCode: ['', Validators.required],
            country: ['', Validators.required],
            isDefault: [false]
        });

        this.addresses.push(addressGroup);
    }

    removeAddress(index: number) {
        this.addresses.removeAt(index);
    }

    loadUsers() {
        this.loading.set(true);
        this.usersService.getUsers(this.filters)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<any>) => {
                    if (response.success) {
                        this.users.set(response.data.users);
                        this.totalItems = response.data.pagination?.total || 0;
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('user.failedToLoad')
                    });
                }
            });
    }

    openNew() {
        this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
        this.userForm.get('password')?.updateValueAndValidity();
        this.user.set({} as User);
        this.submitted.set(false);
        this.userDialog = true;
        this.isEdit.set(false);
        this.showPassword.set(true);
        this.initializeForm();
        this.addresses.clear();
        this.addAddress();
    }

    editUser(userItem: User) {
        // remove validators from password from form group userItem
        this.userForm.get('password')?.clearValidators();
        this.userForm.get('password')?.updateValueAndValidity();
        this.user.set({ ...userItem });
        this.userDialog = true;
        this.isEdit.set(true);
        this.showPassword.set(false);
        this.populateForm(userItem);
    }

    populateForm(userItem: User) {
        this.userForm.patchValue({
            name: userItem.name,
            email: userItem.email,
            role: userItem.role,
            phone: userItem.phone,
            isActive: userItem.isActive,
            preferences: {
                language: userItem.preferences?.language || 'en',
                timezone: userItem.preferences?.timezone || 'UTC',
                notifications: userItem.preferences?.notifications ?? true
            }
        });

        // Clear existing addresses
        this.addresses.clear();

        // Add addresses
        if (userItem.addresses && userItem.addresses.length > 0) {
            userItem.addresses.forEach(address => {
                this.addresses.push(this.fb.group({
                    address: [address.address, Validators.required],
                    city: [address.city, Validators.required],
                    state: [address.state, Validators.required],
                    zipCode: [address.zipCode, Validators.required],
                    country: [address.country, Validators.required],
                    isDefault: [address.isDefault || false]
                }));
            });
        } else {
            this.addAddress();
        }
    }

    hideDialog() {
        this.userDialog = false;
        this.submitted.set(false);
    }

    saveUser() {
        this.submitted.set(true);
        console.log(this.userForm , this.userForm.valid);
        if (this.userForm.valid) {
            const userData = this.userForm.value;
            console.log(this.isEdit());
            if (this.isEdit()) {
                this.updateUser(userData);
            } else {
                this.createUser(userData);
            }
        }
    }

    createUser(userData: CreateUserDto) {
        this.loading.set(true);
        this.usersService.createUser(userData)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<User>) => {
                    if (response.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.success'),
                            detail: this.translate.instant('user.createdSuccessfully')
                        });
                        this.hideDialog();
                        this.loadUsers();
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('user.failedToCreate')
                    });
                }
            });
    }

    updateUser(userData: UpdateUserDto) {
        this.loading.set(true);
        console.log(this.user()._id);
        this.usersService.updateUser(this.user()._id!, userData)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<User>) => {
                    if (response.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.success'),
                            detail: this.translate.instant('user.updatedSuccessfully')
                        });
                        this.hideDialog();
                        this.loadUsers();
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('user.failedToUpdate')
                    });
                }
            });
    }

    deleteUser(userItem: User) {
        this.deleteUserDialog = true;
        this.user.set(userItem);
    }

    confirmDelete() {
        this.loading.set(true);
        this.usersService.deleteUser(this.user()._id!)
            .pipe(
                takeUntil(this.destroy$),
                finalize(() => this.loading.set(false))
            )
            .subscribe({
                next: (response: BaseResponse<any>) => {
                    if (response.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.success'),
                            detail: this.translate.instant('user.deletedSuccessfully')
                        });
                        this.deleteUserDialog = false;
                        this.loadUsers();
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('user.failedToDelete')
                    });
                }
            });
    }

    confirmDeleteSelected() {
        this.deleteUsersDialog = true;
    }

    deleteSelectedUsers() {
        this.loading.set(true);
        const deletePromises = this.selectedUsers().map(userItem => 
            this.usersService.deleteUser(userItem._id!)
        );

        Promise.all(deletePromises)
            .then(() => {
                this.messageService.add({
                    severity: 'success',
                    summary: this.translate.instant('common.success'),
                    detail: this.translate.instant('user.selectedUsersDeleted')
                });
                this.deleteUsersDialog = false;
                this.selectedUsers.set([]);
                this.loadUsers();
            })
            .catch(() => {
                this.messageService.add({
                    severity: 'error',
                    summary: this.translate.instant('common.error'),
                    detail: this.translate.instant('user.failedToDeleteSome')
                });
            })
            .finally(() => {
                this.loading.set(false);
            });
    }

    toggleUserStatus(user: User) {
        const newStatus = !user.isActive;
        this.usersService.updateUserStatus(user._id!, newStatus)
            .subscribe({
                next: (response: BaseResponse<any>) => {
                    if (response.success) {
                        this.messageService.add({
                            severity: 'success',
                            summary: this.translate.instant('common.success'),
                            detail: newStatus ? this.translate.instant('user.activatedSuccessfully') : this.translate.instant('user.deactivatedSuccessfully')
                        });
                        this.loadUsers();
                    }
                },
                error: (error) => {
                    this.messageService.add({
                        severity: 'error',
                        summary: this.translate.instant('common.error'),
                        detail: this.translate.instant('user.failedToUpdateStatus')
                    });
                }
            });
    }

    onPageChange(event: any) {
        this.currentPage = event.page + 1;
        this.itemsPerPage = event.rows;
        this.filters.page = this.currentPage;
        this.filters.limit = this.itemsPerPage;
        this.loadUsers();
    }

    onGlobalFilter(table: Table, event: Event) {
        const value = (event.target as HTMLInputElement).value;
        this.filters.search = value;
        table.filterGlobal(value, 'contains');
    }

    applyFilters() {
        this.filters.page = 1;
        this.currentPage = 1;
        this.loadUsers();
    }

    clearFilters() {
        this.filters = {
            search: '',
            role: undefined,
            isActive: undefined,
            page: 1,
            limit: 10
        };
        this.loadUsers();
    }

    getSeverity(status: boolean): string {
        return status ? 'success' : 'danger';
    }

    getStatusLabel(status: boolean): string {
        return status ? this.translate.instant('common.active') : this.translate.instant('common.inactive');
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
        return this.translate.instant(`user.roles.${role}`) || role.charAt(0).toUpperCase() + role.slice(1);
    }

    getAddressesCount(addresses: Address[]): number {
        return addresses?.length || 0;
    }

    getDefaultAddress(addresses: Address[]): string {
        const defaultAddr = addresses?.find(addr => addr.isDefault);
        if (defaultAddr) {
            return `${defaultAddr.city}, ${defaultAddr.country}`;
        }
        return addresses?.length > 0 ? `${addresses[0].city}, ${addresses[0].country}` : 'No address';
    }
} 