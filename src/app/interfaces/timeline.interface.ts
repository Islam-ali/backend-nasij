export interface MultilingualText {
  en: string;
  ar: string;
}

export interface Timeline {
  _id: string;
  name: MultilingualText;
  dateTime: Date;
  icon: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface OrderTimelineEntry {
  _id: string;
  timelineId: string;
  note?: string;
  dateTime: Date;
  timeline?: Timeline;
}

export interface OrderWithTimelines {
  orderId: string;
  orderNumber: string;
  timelines: OrderTimelineEntry[];
}

export interface CreateTimelineRequest {
  name: MultilingualText;
  dateTime: Date;
  icon: string;
}

export interface UpdateTimelineRequest {
  name?: MultilingualText;
  dateTime?: Date;
  icon?: string;
}

export interface AddTimelineToOrderRequest {
  timelineId: string;
  note?: string;
  dateTime: Date;
}