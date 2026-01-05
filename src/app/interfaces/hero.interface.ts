import { MultilingualText } from "../core/models/multi-language";
import { MediaFile, VideoFile } from "./media-file.interface";

export interface IHero {
  _id: string | null;
  title: MultilingualText;
  subTitle?: MultilingualText;
  buttonName?: MultilingualText;
  buttonLink?: string;
  image?: MediaFile;
  video?: VideoFile;
  startDate?: Date | string;
  endDate?: Date | string;
  isAlways: boolean;
  isActive: boolean;
  order?: number;
  status?: 'draft' | 'published' | 'archived';
  createdBy?: string;
  updatedBy?: string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
  // Virtual properties (computed)
  isCurrentlyActive?: boolean;
  isScheduledForFuture?: boolean;
  isExpired?: boolean;
} 