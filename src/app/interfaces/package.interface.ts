import { IProduct } from './product.interface';

export interface IRequiredVariantAttribute {
  variant: string;
  value: string;
}

export interface IPackageItem {
  productId: string;
  quantity: number;
  requiredVariantAttributes: IRequiredVariantAttribute[];
  sku?: string;
  product?: IProduct; // For populated data
}

export interface IPackage {
  _id?: string;
  id?: string;
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  items: IPackageItem[];
  images: string[];
  tags: string[];
  isActive: boolean;
  soldCount: number;
  averageRating: number;
  reviewCount: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface IPackageInventorySummary {
  packageStock: number;
  productInventory: Array<{
    productId: string;
    productName: string;
    requiredQuantity: number;
    availableStock: number;
    variantDetails?: Array<{
      variant: string;
      value: string;
      stock: number;
    }>;
  }>;
}

export interface IPackageOrderValidation {
  isValid: boolean;
  message: string;
  packageDetails?: IPackage;
}

export interface IPackageOrderResult {
  success: boolean;
  message: string;
  orderId?: string;
}

export interface CreatePackageDto {
  name: string;
  description: string;
  price: number;
  discountPrice?: number;
  stock: number;
  items: IPackageItem[];
  images: string[];
  tags: string[];
  isActive?: boolean;
}

export interface UpdatePackageDto extends Partial<CreatePackageDto> {}

export interface ValidatePackageOrderDto {
  packageId: string;
  quantity: number;
  variantChoices: Array<{
    productId: string;
    variant: string;
    value: string;
  }>;
} 