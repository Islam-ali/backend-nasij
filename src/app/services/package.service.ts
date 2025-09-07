import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IPackage, CreatePackageDto, UpdatePackageDto, ValidatePackageOrderDto, IPackageOrderValidation, IPackageInventorySummary } from '../interfaces/package.interface';
import { GenericApiService } from '../core/services/generic-api.service';
import { CommonService } from '../core/services/common.service';
import { BaseResponse, pagination } from '../core/models/baseResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class PackageService {
  private apiUrl = `${environment.apiUrl}/packages`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  getPackages(queryParams?: any): Observable<BaseResponse<{packages: IPackage[], pagination: pagination}>> {
    return this.genericApiService.Get(this.apiUrl, queryParams);
  }

  getPackagesList(queryParams?: any): Observable<BaseResponse<IPackage[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/list`, queryParams);
  }

  getActivePackages(): Observable<BaseResponse<IPackage[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/active`);
  }

  getPackage(id: string): Observable<BaseResponse<IPackage>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  getPackagesByProduct(productId: string): Observable<BaseResponse<IPackage[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/product/${productId}`);
  }

  createPackage(packageData: CreatePackageDto): Observable<BaseResponse<IPackage>> {
    return this.genericApiService.Post(
      this.apiUrl, 
      this.commonService.removeNullUndefinedEmptyStringKeys(packageData)
    );
  }

  updatePackage(id: string, packageData: UpdatePackageDto): Observable<BaseResponse<IPackage>> {
    return this.genericApiService.Patch(
      this.apiUrl, 
      id, 
      this.commonService.removeNullUndefinedEmptyStringKeysAndId(packageData)
    );
  }

  deletePackage(id: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Delete(this.apiUrl, id);
  }

  validateOrder(validateData: ValidatePackageOrderDto): Observable<BaseResponse<IPackageOrderValidation>> {
    return this.genericApiService.Post(`${this.apiUrl}/validate-order`, validateData);
  }

  getInventorySummary(packageId: string): Observable<BaseResponse<IPackageInventorySummary>> {
    return this.genericApiService.Get(`${this.apiUrl}/${packageId}/inventory-summary`);
  }

  updatePackageStatus(id: string, isActive: boolean): Observable<BaseResponse<any>> {
    return this.genericApiService.Patch(this.apiUrl, id, { isActive });
  }

  searchPackages(searchTerm: string): Observable<BaseResponse<IPackage[]>> {
    return this.genericApiService.Get(this.apiUrl, { search: searchTerm });
  }

  getPackagesByTags(tags: string[]): Observable<BaseResponse<IPackage[]>> {
    return this.genericApiService.Get(this.apiUrl, { tags: tags.join(',') });
  }

  getPackagesByPriceRange(minPrice: number, maxPrice: number): Observable<BaseResponse<IPackage[]>> {
    return this.genericApiService.Get(this.apiUrl, { minPrice, maxPrice });
  }
} 