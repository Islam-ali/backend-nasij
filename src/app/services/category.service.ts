import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse, pagination } from '../core/models/baseResponse';
import { ICategory } from '../interfaces/category.interface';
import { CommonService } from '../core/services/common.service';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = `${environment.apiUrl}/categories`;

  constructor(
    private _genericApiService: GenericApiService<any>,
    private commonService: CommonService) {}

  // Get all categories
  getCategories(queryParams?: any): Observable<BaseResponse<{categories:ICategory[], pagination:pagination}>> {
    return this._genericApiService.Get(this.apiUrl, queryParams);
  }

  // get list categories
  listCategories(): Observable<BaseResponse<ICategory[]>> {
    return this._genericApiService.Get(`${this.apiUrl}/list`);
  }

  // Create a new category
  createCategory(category: ICategory): Observable<BaseResponse<ICategory>> {
    return this._genericApiService.Post(this.apiUrl, this.commonService.removeNullUndefinedEmptyStringKeys(category));
  }

  // Update a category
  updateCategory(id: string, category: ICategory): Observable<BaseResponse<ICategory>> {
    return this._genericApiService.Patch(this.apiUrl +`/${id}`, this.commonService.removeNullUndefinedEmptyStringKeysAndId(category));
  }

  // Delete a category
  deleteCategory(id: string): Observable<BaseResponse<any>> {
    return this._genericApiService.Delete(this.apiUrl, id);
  }

  // Get category by ID
  getCategoryById(id: string, queryParams?: any): Observable<BaseResponse<ICategory>> {
    return this._genericApiService.Get(`${this.apiUrl}/${id}`, queryParams);
  }
}
