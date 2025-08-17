import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Banner } from '../interfaces/banner.interface';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../core/models/baseResponse';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private apiUrl = `${environment.apiUrl}/banners`;

  constructor(private http: HttpClient) {}

  getAllBanners(): Observable<BaseResponse<Banner[]>> {
    return this.http.get<BaseResponse<Banner[]>>(this.apiUrl);
  }

  getActiveBanners(): Observable<BaseResponse<Banner[]>> {
    return this.http.get<BaseResponse<Banner[]>>(`${this.apiUrl}?active=true`);
  }

  getBannerById(id: string): Observable<BaseResponse<Banner>> {
    return this.http.get<BaseResponse<Banner>>(`${this.apiUrl}/${id}`);
  }

  createBanner(banner: Omit<Banner, 'id' | 'createdAt' | 'updatedAt'>): Observable<BaseResponse<Banner>> {
    return this.http.post<BaseResponse<Banner>>(this.apiUrl, banner);
  }

  updateBanner(id: string, banner: Partial<Banner>): Observable<BaseResponse<Banner>> {
    return this.http.patch<BaseResponse<Banner>>(`${this.apiUrl}/${id}`, banner);
  }

  deleteBanner(id: string): Observable<BaseResponse<void>> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`);
  }

  toggleBannerActive(id: string): Observable<BaseResponse<Banner>> {
    return this.http.patch<BaseResponse<Banner>>(`${this.apiUrl}/${id}/toggle`, {});
  }
} 