import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Feature } from '../interfaces/feature.interface';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../core/models/baseResponse';

@Injectable({
  providedIn: 'root'
})
export class FeatureService {
  private apiUrl = `${environment.apiUrl}/features`;

  constructor(private http: HttpClient) {}

  getAllFeatures(): Observable<BaseResponse<Feature[]>> {
    return this.http.get<BaseResponse<Feature[]>>(this.apiUrl);
  }

  getActiveFeatures(): Observable<BaseResponse<Feature[]>> {
    return this.http.get<BaseResponse<Feature[]>>(`${this.apiUrl}?active=true`);
  }

  getFeatureById(id: string): Observable<BaseResponse<Feature>> {
    return this.http.get<BaseResponse<Feature>>(`${this.apiUrl}/${id}`);
  }

  createFeature(feature: Omit<Feature, '_id' | 'createdAt' | 'updatedAt'>): Observable<BaseResponse<Feature>> {
    return this.http.post<BaseResponse<Feature>>(this.apiUrl, feature);
  }

  updateFeature(id: string, feature: Partial<Feature>): Observable<BaseResponse<Feature>> {
    return this.http.patch<BaseResponse<Feature>>(`${this.apiUrl}/${id}`, feature);
  }

  deleteFeature(id: string): Observable<BaseResponse<void>> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`);
  }

  toggleFeatureActive(id: string): Observable<BaseResponse<Feature>> {
    return this.http.patch<BaseResponse<Feature>>(`${this.apiUrl}/${id}/toggle`, {});
  }

  updateFeatureSortOrder(id: string, sortOrder: number): Observable<BaseResponse<Feature>> {
    return this.http.patch<BaseResponse<Feature>>(`${this.apiUrl}/${id}/sort`, { sortOrder });
  }
} 