import { Archived } from "../shared/components/fields/models/Archived";
import { MultilingualText } from "../core/models/multi-language";

export interface IResponsiveGridConfig {
  sm: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface IGridConfig {
  gridCols: IResponsiveGridConfig;
  colSpans?: IResponsiveGridConfig[];
  justifyContent?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'center' | 'start' | 'end' | 'stretch';
  heightMode?: 'auto' | 'fixed' | 'min' | 'max' | 'aspect-ratio';
  height?: string;
  aspectRatio?: string;
}

export interface ICollectionItem {
  title: MultilingualText;
  description: MultilingualText;
  image: Archived;
  buttonText: MultilingualText;
  buttonLink: string;
  queryParams?: Record<string, string>;
}

export interface IFeaturedCollection {
  _id: string;
  sectionSubtitle: MultilingualText;
  sectionTitle: MultilingualText;
  description: MultilingualText;
  collections: ICollectionItem[];
  gridConfig: IGridConfig;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 