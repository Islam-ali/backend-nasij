import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { 
  Timeline, 
  CreateTimelineRequest, 
  UpdateTimelineRequest, 
  AddTimelineToOrderRequest,
  OrderWithTimelines 
} from '../interfaces/timeline.interface';
import { CommonService } from '../core/services/common.service';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse } from '../core/models/baseResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TimelineService {
  private apiUrl = `${environment.apiUrl}/timelines`;
  private orderApiUrl = `${environment.apiUrl}/orders`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  // Timeline CRUD operations
  getTimelines(): Observable<BaseResponse<Timeline[]>> {
    return this.genericApiService.Get(this.apiUrl);
  }

  getTimeline(id: string): Observable<BaseResponse<Timeline>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  createTimeline(timeline: CreateTimelineRequest): Observable<BaseResponse<Timeline>> {
    const transformedTimeline = this.commonService.removeNullUndefinedEmptyStringKeys(timeline);
    return this.genericApiService.Post(this.apiUrl, transformedTimeline);
  }

  updateTimeline(id: string, timeline: UpdateTimelineRequest): Observable<BaseResponse<Timeline>> {
    const transformedTimeline = this.commonService.removeNullUndefinedEmptyStringKeys(timeline);
    return this.genericApiService.Patch(this.apiUrl, id, transformedTimeline);
  }

  deleteTimeline(id: string): Observable<BaseResponse<void>> {
    return this.genericApiService.Delete(this.apiUrl, id);
  }

  // Order Timeline operations
  addTimelineToOrder(orderId: string, timelineData: AddTimelineToOrderRequest): Observable<BaseResponse<any>> {
    const transformedData = this.commonService.removeNullUndefinedEmptyStringKeys(timelineData);
    return this.genericApiService.Post(`${this.orderApiUrl}/${orderId}/timelines`, transformedData);
  }

  getOrderTimelines(orderId: string): Observable<BaseResponse<OrderWithTimelines>> {
    return this.genericApiService.Get(`${this.orderApiUrl}/${orderId}/timelines`);
  }

  removeTimelineFromOrder(orderId: string, timelineId: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Delete(`${this.orderApiUrl}/${orderId}/timelines`, timelineId);
  }
}