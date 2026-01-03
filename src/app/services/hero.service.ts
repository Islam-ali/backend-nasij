import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IHero } from '../interfaces/hero.interface';
import { BaseResponse } from '../core/models/baseResponse';
import { GenericApiService } from '../core/services/generic-api.service';
import { CommonService } from '../core/services/common.service';

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private apiUrl = `${environment.apiUrl}/hero`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService    
  ) {}

  // Get all heroes with pagination and filtering
  getHeroes(params: any = {}): Observable<BaseResponse<{ heroes: IHero[], pagination: any }>> {
    let httpParams: any = {};
    
    if (params.page) httpParams.page = params.page;
    if (params.limit) httpParams.limit = params.limit;
    if (params.isAlways !== undefined) httpParams.isAlways = params.isAlways;
    if (params.isActive !== undefined) httpParams.isActive = params.isActive;
    if (params.search) httpParams.search = params.search;
    

    return this.genericApiService.Get(this.apiUrl,  httpParams );
  }

  // Get active heroes for frontend display
  getActiveHeroes(): Observable<BaseResponse<IHero[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/active`);
  }

  // Get hero by ID
  getHero(id: string): Observable<BaseResponse<IHero>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  // Create new hero
  createHero(hero: Partial<IHero>): Observable<BaseResponse<IHero>> {
    return this.genericApiService.Post(this.apiUrl, this.commonService.removeNullUndefinedEmptyStringKeysAndId(hero));
  }

  // Update hero
  updateHero(id: string, hero: Partial<IHero>): Observable<BaseResponse<IHero>> {
    return this.genericApiService.Patch(`${this.apiUrl +`/${id}`}`, this.commonService.removeNullUndefinedEmptyStringKeysAndId(hero));
  }

  // Delete hero
  deleteHero(id: string): Observable<BaseResponse<IHero>> {
    return this.genericApiService.Delete(`${this.apiUrl}`, id);
  }
} 