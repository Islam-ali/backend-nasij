export interface Address {
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  MANAGER = 'manager',
  CUSTOMER = 'customer',
}

export interface User {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  password?: string;
  role: UserRole;
  addresses: Address[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  phone?: string;
  avatar?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: boolean;
  };
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  addresses?: Address[];
  isActive?: boolean;
  phone?: string;
  avatar?: string;
  preferences?: {
    language?: string;
    timezone?: string;
    notifications?: boolean;
  };
}

export interface UpdateUserDto extends Partial<CreateUserDto> {
  password?: string;
}

export interface UserFilters {
  search?: string;
  role?: UserRole;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface UserListResponse {
  users: User[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
