export interface IMultiLanguageText {
  en?: string;
  ar?: string;
}

export interface IFilterRule {
  field: string; // e.g., 'category', 'brand', 'price', 'tags', 'isActive'
  operator: 'equals' | 'in' | 'gte' | 'lte' | 'contains' | 'exists' | 'ne' | 'nin' | 'regex';
  value: any; // Dynamic value: string, number, array, etc.
}

export interface ISortingRule {
  field: string; // e.g., 'createdAt', 'price', 'name.en'
  order: 'asc' | 'desc';
}

export interface IProductFeature {
  _id?: string;
  title: IMultiLanguageText;
  description?: IMultiLanguageText;
  limit: number;
  sorting?: ISortingRule;
  filters?: IFilterRule[];
  isActive?: boolean;
  displayOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}






