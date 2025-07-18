export interface Address {
  street: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  isDefault?: boolean;
}

export enum UserRole {
  ADMIN = 'admin',
  CUSTOMER = 'customer',
}

export interface User {
  id?: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  addresses: Address[];
  isActive: boolean;
  lastLogin?: Date;
}
