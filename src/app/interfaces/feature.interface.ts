import { Archived } from "../shared/components/fields/models/Archived";

export interface Feature {
  _id?: string;
  icon: Archived;        // أيقونة (اسم أيقونة، أو كلاس من مكتبة، أو SVG URL)
  title: string;       // "Free Shipping"
  description: string; // "Free shipping on all orders over $50..."
  isActive?: boolean;
  sortOrder?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 