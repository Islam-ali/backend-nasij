import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IProduct } from '../interfaces/product.interface';
import { CommonService } from '../core/services/common.service';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse, pagination } from '../core/models/baseResponse';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'https://nasig-backend-sigma.vercel.app/api/v1/products';

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService) {}

  getProducts(queryParams?: any): Observable<BaseResponse<{products:IProduct[], pagination:pagination}>> {
    return this.genericApiService.Get(this.apiUrl, queryParams);
  }

  getProductsList(queryParams?: any): Observable<BaseResponse<IProduct[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/list`, queryParams);
  }

  getProduct(id: string): Observable<BaseResponse<IProduct>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  createProduct(product: IProduct): Observable<BaseResponse<IProduct>> {
    return this.genericApiService.Post(this.apiUrl, this.commonService.removeNullUndefinedEmptyStringKeys(product));
  }

  updateProduct(id: string, product: IProduct): Observable<BaseResponse<IProduct>> {
    return this.genericApiService.Patch(`${this.apiUrl}`, id ,this.commonService.removeNullUndefinedEmptyStringKeys(product));
  }

  deleteProduct(id: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Delete(`${this.apiUrl}`, id);
  }

  updateProductStatus(id: string, status: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Put(`${this.apiUrl}`, id, {status:status});
  }

}
