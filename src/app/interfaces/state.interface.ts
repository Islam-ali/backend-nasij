import { MultilingualText } from '../core/models/multi-language';
import { ICountry } from './country.interface';

export interface IState {
  _id?: string;
  name: MultilingualText;
  code: string;
  shippingCost: number;
  countryId: ICountry;
  country?: ICountry;
  isActive: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateStateRequest {
  name: MultilingualText;
  code: string;
  shippingCost: number;
  countryId: string;
  isActive?: boolean;
}

export interface IUpdateStateRequest {
  name?: MultilingualText;
  code?: string;
  shippingCost?: number;
  countryId?: string;
  isActive?: boolean;
}