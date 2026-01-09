import { MultilingualText } from '../core/models/multi-language';
import { IProfessionalGridConfig } from './professional-grid.interface';

export interface IHeroLayoutItem {
  title: MultilingualText;
  description: MultilingualText;
  image: {
    filePath: string;
    fileName: string;
    fileSize: number;
    uploadDate: Date;
  };
  buttonText: MultilingualText;
  buttonLink: string;
  queryParams?: any;
}

export interface IHeroLayout {
  _id?: string;
  name: string;
  sectionTitle?: MultilingualText;
  sectionSubtitle?: MultilingualText;
  description?: MultilingualText;
  items: IHeroLayoutItem[];
  gridConfig: IProfessionalGridConfig;
  isActive: boolean;
  displayOrder: number;
  tags?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

