import { Archived } from "../shared/components/fields/models/Archived";
import { MultilingualText } from "../core/models/multi-language";

export interface IHero {
  _id: string | null;
  title: MultilingualText;
  subTitle?: MultilingualText;
  buttonName?: MultilingualText;
  buttonLink?: string;
  image?: Archived;
  startDate?: Date;
  endDate?: Date;
  isAlways: boolean;
  isActive: boolean;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
} 