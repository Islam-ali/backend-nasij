import { Archived } from "../shared/components/fields/models/Archived";

export interface ICollectionItem {
  title: string;
  description: string;
  image: Archived;
  buttonText: string;
  buttonLink: string;
  queryParams?: Record<string, string>;
}

export interface IFeaturedCollection {
  _id: string;
  sectionSubtitle: string;
  sectionTitle: string;
  description: string;
  collections: ICollectionItem[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
} 