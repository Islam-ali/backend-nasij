import { Archived } from "../shared/components/fields/models/Archived";

export interface BannerButton {
  label: string;             // "Shop Sale"
  url: string;               // "/shop/sale"
  params?: Record<string, string>; // { category: "men", sort: "new" }
}

export interface Banner {
  _id?: string;
  tag: string;               // "Limited Time Offer"
  title: string;             // "Get 50% Off On New Arrivals"
  description: string;       // "Don't miss out..."
  image: Archived;          // الصورة الجانبية
  buttons: BannerButton[];
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
} 