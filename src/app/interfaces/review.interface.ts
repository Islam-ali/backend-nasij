import { Archived } from "../shared/components/fields/models/Archived";

export interface IReview {
  _id?: string;
  customerName: string;
  rating: number; // 1-5
  comment?: string;
  images?: Archived[];
  video?: Archived;
  videoUrl?: string;
  isActive: boolean;
  isPinned: boolean;
  order?: number;
  reviewDate?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

