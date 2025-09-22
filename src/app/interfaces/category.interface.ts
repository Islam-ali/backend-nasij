import { MultilingualText } from "../core/models/multi-language";

export interface ICategory {
  _id?: string;
  name: MultilingualText;
  slug: MultilingualText;
  description?: MultilingualText;
  parentId?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}
