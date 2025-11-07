import { MultilingualText } from "../core/models/multi-language";
import { Archived } from "../shared/components/fields/models/Archived";


export interface IBrand {
  _id?: string;
  name: MultilingualText;
  description?: MultilingualText;
  logo?: Archived;
  website?: string;
  slug: string;
  isActive: boolean;
  productCount: number;
}
