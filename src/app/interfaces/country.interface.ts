import { MultilingualText } from '../core/models/multi-language';
import { IState } from './state.interface';

export interface ICountry {
  _id?: string;
  name: MultilingualText;
  code: string;
  defaultShippingCost: number;
  isActive: boolean;
  states?: IState[];
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ICreateCountryRequest {
  name: MultilingualText;
  code: string;
  defaultShippingCost: number;
  isActive?: boolean;
}

export interface IUpdateCountryRequest {
  name?: MultilingualText;
  code?: string;
  defaultShippingCost?: number;
  isActive?: boolean;
}