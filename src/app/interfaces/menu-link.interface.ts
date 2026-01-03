import { MultilingualText } from '../core/models/multi-language';

export enum MenuLinkType {
  TEXT = 'text',
  DROPDOWN = 'dropdown',
}

export enum MenuLinkStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

export interface DropdownConfig {
  apiUrl: string;
  method?: 'GET' | 'POST';
  valueField: string;
  labelField: MultilingualText;
  urlTemplate: string;
}

export interface IMenuLink {
  _id?: string;
  key: string;
  type: MenuLinkType;
  status: MenuLinkStatus;
  order: number;
  title: MultilingualText;
  url?: string;
  dropdownConfig?: DropdownConfig;
  createdAt?: string;
  updatedAt?: string;
}

