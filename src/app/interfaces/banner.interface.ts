import { MultilingualText } from "../core/models/multi-language";
import { Archived } from "../shared/components/fields/models/Archived";

export interface BannerButton {
  label: MultilingualText;   // { en: "Shop Sale", ar: "تسوق الآن" }
  url: string;               // "/shop/sale"
  params?: Record<string, string>; // { category: "men", sort: "new" }
}

export interface Banner {
  _id?: string;
  tag: MultilingualText;     // { en: "Limited Time Offer", ar: "عرض لفترة محدودة" }
  title: MultilingualText;   // { en: "Get 50% Off On New Arrivals", ar: "احصل على خصم 50%" }
  description: MultilingualText; // { en: "Don't miss out...", ar: "لا تفوت..." }
  image: Archived;          // الصورة الجانبية
  buttons: BannerButton[];
  isActive?: boolean;
  startDate?: Date;
  endDate?: Date;
  background?: string;       // Background color or gradient
  alignItems?: string;      // Vertical alignment (flex-start, center, flex-end)
  justifyContent?: string;   // Horizontal alignment (flex-start, center, flex-end, space-between, space-around)
  createdAt?: Date;
  updatedAt?: Date;
}

export type SupportedLanguage = 'en' | 'ar'; 