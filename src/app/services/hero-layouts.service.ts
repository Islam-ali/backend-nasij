import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse } from '../core/models/baseResponse';
import { CommonService } from '../core/services/common.service';
import { environment } from '../../environments/environment';
import { IHeroLayout } from '../interfaces/hero-layout.interface';

@Injectable({
  providedIn: 'root'
})
export class HeroLayoutsService {
  private readonly apiUrl = `${environment.apiUrl}/hero-layouts`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  // Get all hero layouts
  getHeroLayouts(queryParams?: any): Observable<BaseResponse<IHeroLayout[]>> {
    return this.genericApiService.Get(this.apiUrl, queryParams);
  }

  // Get active hero layouts
  getActiveHeroLayouts(): Observable<BaseResponse<IHeroLayout[]>> {
    return this.genericApiService.Get(this.apiUrl, { active: 'true' });
  }

  // Get hero layout by ID
  getHeroLayoutById(id: string): Observable<BaseResponse<IHeroLayout>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  // Get hero layout by name
  getHeroLayoutByName(name: string): Observable<BaseResponse<IHeroLayout>> {
    return this.genericApiService.Get(`${this.apiUrl}/by-name/${name}`);
  }

  // Create new hero layout
  createHeroLayout(heroLayout: Partial<IHeroLayout>): Observable<BaseResponse<IHeroLayout>> {
    return this.genericApiService.Post(
      this.apiUrl, 
      this.commonService.removeNullUndefinedEmptyStringKeys(heroLayout)
    );
  }

  // Update hero layout
  updateHeroLayout(id: string, heroLayout: Partial<IHeroLayout>): Observable<BaseResponse<IHeroLayout>> {
    return this.genericApiService.Patch(
      `${this.apiUrl}/${id}`, 
      this.commonService.removeNullUndefinedEmptyStringKeysAndId(heroLayout)
    );
  }

  // Delete hero layout
  deleteHeroLayout(id: string): Observable<BaseResponse<void>> {
    return this.genericApiService.Delete(this.apiUrl, id);
  }

  // Toggle active status
  toggleActiveStatus(id: string): Observable<BaseResponse<IHeroLayout>> {
    return this.genericApiService.Patch(`${this.apiUrl}/${id}/toggle-active`, {});
  }

  // Reorder hero layouts
  reorderHeroLayouts(orderedIds: string[]): Observable<BaseResponse<IHeroLayout[]>> {
    return this.genericApiService.Put(`${this.apiUrl}/reorder`, orderedIds);
  }
}






