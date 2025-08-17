import { Archived } from "../shared/components/fields/models/Archived";

export interface IHero {
  _id: string | null;
  title: string;
  subTitle?: string;
  buttonName?: string;
  buttonLink?: string;
  image?: Archived;
  startDate?: Date;
  endDate?: Date;
  isAlways: boolean;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
} 