export interface ICategory {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  parentId?: string;
  image?: string;
  sortOrder: number;
  isActive: boolean;
  productCount: number;
}
