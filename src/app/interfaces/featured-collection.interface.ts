import { Archived } from "../shared/components/fields/models/Archived";
import { MultilingualText } from "../core/models/multi-language";
import { IProfessionalGridConfig } from './professional-grid.interface';

export interface IResponsiveGridConfig {
  sm: number;
  md?: number;
  lg?: number;
  xl?: number;
}

export interface IGridConfig {
  gridCols: IResponsiveGridConfig;
  gridRows?: IResponsiveGridConfig;
  colSpans?: IResponsiveGridConfig[];
  rowSpans?: IResponsiveGridConfig[];
  gap?: number;
  rowHeight?: string;
  justifyContent?: 'center' | 'start' | 'end' | 'between' | 'around' | 'evenly';
  alignItems?: 'center' | 'start' | 'end' | 'stretch';
  heightMode?: 'auto' | 'fixed' | 'min' | 'max' | 'aspect-ratio';
  height?: string;
  aspectRatio?: string;
  width?: string;
  parentCustomStyle?: string;
  itemsCustomStyle?: string[]; // Changed to string array for Tailwind classes
  heroGrid?: IProfessionalGridConfig; // New Professional Grid Config
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