import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { BaseResponse } from '../core/models/baseResponse';
import { IProductFeature } from '../interfaces/product-feature.interface';
import { IProduct } from '../interfaces/product.interface';

@Injectable({
  providedIn: 'root',
})
export class ProductFeaturesService {
  private apiUrl = `${environment.apiUrl}/product-features`;

  constructor(private http: HttpClient) {}

  getAll(): Observable<BaseResponse<IProductFeature[]>> {
    return this.http.get<BaseResponse<IProductFeature[]>>(this.apiUrl);
  }

  getAllActive(): Observable<BaseResponse<IProductFeature[]>> {
    return this.http.get<BaseResponse<IProductFeature[]>>(`${this.apiUrl}/active`);
  }

  getById(id: string): Observable<BaseResponse<IProductFeature>> {
    return this.http.get<BaseResponse<IProductFeature>>(`${this.apiUrl}/${id}`);
  }

  getFeatureProducts(id: string): Observable<BaseResponse<IProduct[]>> {
    return this.http.get<BaseResponse<IProduct[]>>(`${this.apiUrl}/${id}/products`);
  }

  previewProducts(
    filters: any[],
    sorting: any,
    limit: number
  ): Observable<BaseResponse<IProduct[]>> {
    return this.http.post<BaseResponse<IProduct[]>>(`${this.apiUrl}/preview`, {
      filters,
      sorting,
      limit,
    });
  }

  create(feature: IProductFeature): Observable<BaseResponse<IProductFeature>> {
    return this.http.post<BaseResponse<IProductFeature>>(this.apiUrl, feature);
  }

  update(id: string, feature: Partial<IProductFeature>): Observable<BaseResponse<IProductFeature>> {
    return this.http.put<BaseResponse<IProductFeature>>(`${this.apiUrl}/${id}`, feature);
  }

  delete(id: string): Observable<BaseResponse<void>> {
    return this.http.delete<BaseResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

