import { Archived } from "../shared/components/fields/models/Archived";
import { MultilingualText } from "../core/models/multi-language";

export interface ISocialMedia {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  linkedin?: string;
  tiktok?: string;
}

export interface IContactInfo {
  email: string;
  phone: string;
  address: MultilingualText;
  mapLocation?: string;
}

export interface IFAQ {
  question: MultilingualText;
  answer: MultilingualText;
}

export interface IPaymobSettings {
  apiKey?: string;
  integrationId?: string;
  walletIntegrationId?: string;
  iframeId?: string;
  hmacSecret?: string;
  callbackUrl?: string;
  webhookUrl?: string;
  responseCallbackUrl?: string;
  enabled: boolean;
}

export interface IBusinessProfile {
  _id: string;
  logo_dark?: Archived;
  logo_light?: Archived;
  name: MultilingualText;
  description: MultilingualText;
  socialMedia: ISocialMedia;
  contactInfo: IContactInfo;
  privacyPolicy: MultilingualText;
  termsOfService: MultilingualText;
  vodafoneCashAccount: string;
  paymobSettings?: IPaymobSettings;
  faq: IFAQ[];
  createdAt: Date;
  updatedAt: Date;
} 