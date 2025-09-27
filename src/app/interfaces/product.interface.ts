import { IBrand } from "./brand.interface";
import { ICategory } from "./category.interface";
import { MultilingualText } from "../core/models/multi-language";
import { Archived } from "../shared/components/fields/models/Archived";

export interface ProductVariant {

  price: number;
  stock?: number;
  sku?: string;
  attributes?: ProductVariantAttribute[];
}

export interface ProductVariantAttribute {
  _id: string;
  variant: string;
  value: MultilingualText;
  image?: Archived;
}

export enum ProductStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  OUT_OF_STOCK = 'out_of_stock',
}

export interface IProduct {
  _id: string | null;
  id: string;
  name: MultilingualText;
  description: MultilingualText;
  price: number;
  discountPrice?: number;
  category: ICategory;
  brand: IBrand;
  images: string[];
  variants: ProductVariant[];
  stock: number;
  status: ProductStatus;
  sku: string;
  tags: string[];
  weight?: number;
  colors?: string[];
  sizes?: string[];
  gender?: string;
  season?: string;
  material?: string;
  details: { name: MultilingualText; value: MultilingualText }[];
  seoTitle?: MultilingualText;
  seoDescription?: MultilingualText;
  seoKeywords?: string;
  dimensions: {
    length: number;
    width: number;
    height: number;
  };
  useVariantPrice?: boolean;
  averageRating?: number;
  reviewCount?: number;
  soldCount?: number;
}
