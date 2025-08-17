import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../core/models/baseResponse';
import { IFeaturedCollection } from '../interfaces/featured-collection.interface';
import { GenericApiService } from '../core/services/generic-api.service';

@Injectable({
  providedIn: 'root'
})
export class FeaturedCollectionsService {
  private apiUrl = `${environment.apiUrl}/featured-collections`;
  private _genericApiService: GenericApiService<BaseResponse<IFeaturedCollection[]>>;

  constructor(private http: HttpClient) {
    this._genericApiService = new GenericApiService<BaseResponse<IFeaturedCollection[]>>(this.http);
  }

  // Get all featured collections
  getFeaturedCollections(activeOnly: boolean = false): Observable<BaseResponse<IFeaturedCollection[]>> {
    const params = activeOnly ? { active: 'true' } : {};
    return this._genericApiService.Get(this.apiUrl, params);
  }

  // Get featured collection by ID
  getFeaturedCollectionById(id: string): Observable<BaseResponse<IFeaturedCollection>> {
    return this.http.get<BaseResponse<IFeaturedCollection>>(`${this.apiUrl}/${id}`);
  }

  // Create new featured collection
  createFeaturedCollection(collection: Partial<IFeaturedCollection>): Observable<BaseResponse<IFeaturedCollection>> {
    return this.http.post<BaseResponse<IFeaturedCollection>>(this.apiUrl, collection);
  }

  // Update featured collection
  updateFeaturedCollection(id: string, collection: Partial<IFeaturedCollection>): Observable<BaseResponse<IFeaturedCollection>> {
    return this.http.patch<BaseResponse<IFeaturedCollection>>(`${this.apiUrl}/${id}`, collection);
  }

  // Delete featured collection
  deleteFeaturedCollection(id: string): Observable<BaseResponse<void>> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`);
  }

  // Toggle active status
  toggleActive(id: string): Observable<BaseResponse<IFeaturedCollection>> {
    return this.http.patch<BaseResponse<IFeaturedCollection>>(`${this.apiUrl}/${id}/toggle`, {});
  }
} 