import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericApiService } from '../core/services/generic-api.service';
import { CommonService } from '../core/services/common.service';
import { IBusinessProfile } from '../interfaces/business-profile.interface';
import { BaseResponse, pagination } from '../core/models/baseResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BusinessProfileService {
  private apiUrl = `${environment.apiUrl}/business-profile`;

  constructor(
    private _genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  // Get business profiles with pagination
  getBusinessProfiles(queryParams?: any): Observable<BaseResponse<IBusinessProfile[]>> {
    return this._genericApiService.Get(this.apiUrl, queryParams);
  }

  // Get all business profiles without pagination
  listBusinessProfiles(): Observable<BaseResponse<IBusinessProfile[]>> {
    return this._genericApiService.Get(this.apiUrl);
  }

  // Get latest business profile
  getLatestBusinessProfile(): Observable<BaseResponse<IBusinessProfile>> {
    return this._genericApiService.Get(`${this.apiUrl}/latest`);
  }

  // Create a new business profile
  createBusinessProfile(businessProfile: IBusinessProfile): Observable<BaseResponse<IBusinessProfile>> {
    return this._genericApiService.Post(this.apiUrl, this.commonService.removeNullUndefinedEmptyStringKeys(businessProfile));
  }

  // Update a business profile
  updateBusinessProfile(id: string, businessProfile: IBusinessProfile): Observable<BaseResponse<IBusinessProfile>> {
    return this._genericApiService.Patch(this.apiUrl, id, this.commonService.removeNullUndefinedEmptyStringKeysAndId(businessProfile));
  }

  // Delete a business profile
  deleteBusinessProfile(id: string): Observable<BaseResponse<null>> {
    return this._genericApiService.Delete(this.apiUrl, id);
  }

  // Get business profile by ID
  getBusinessProfileById(id: string, queryParams?: any): Observable<BaseResponse<IBusinessProfile>> {
    return this._genericApiService.Get(`${this.apiUrl}/${id}`, queryParams);
  }

  // Upload logo
  uploadLogo(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this._genericApiService.Post(`${this.apiUrl}/upload-logo`, formData);
  }
} 