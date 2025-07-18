export interface IBrand {
  _id?: string;
  name: string;
  description?: string;
  logo?: string;
  website?: string;
  slug: string;
  isActive: boolean;
  productCount: number;
}
