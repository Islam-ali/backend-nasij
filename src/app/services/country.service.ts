import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ICountry } from '../interfaces/country.interface';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse } from '../core/models/baseResponse';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly apiUrl = `${environment.apiUrl}/countries`;

  constructor(private genericApiService: GenericApiService<any>) {}

  // Get all countries
  getCountries(withStates: boolean = false): Observable<BaseResponse<ICountry[]>> {
    const params = withStates ? { withStates: 'true' } : {};
    return this.genericApiService.Get(this.apiUrl, { params });
  }

  // Get country by ID
  getCountry(id: string, withStates: boolean = false): Observable<BaseResponse<ICountry>> {
    const params = withStates ? { withStates: 'true' } : {};
    return this.genericApiService.Get(`${this.apiUrl}/${id}`, { params });
  }

  // Create new country
  createCountry(country: Partial<ICountry>): Observable<BaseResponse<ICountry>> {
    return this.genericApiService.Post(this.apiUrl, country);
  }

  // Update country
  updateCountry(id: string, country: Partial<ICountry>): Observable<BaseResponse<ICountry>> {
    return this.genericApiService.Patch(this.apiUrl, id, country);
  }

  // Delete country
  deleteCountry(id: string, soft: boolean = false): Observable<BaseResponse<void>> {
    const params = soft ? { soft: 'true' } : {};
    return this.genericApiService.Delete(this.apiUrl, id);
  }

  // Get shipping cost for country/state
  getShippingCost(countryId: string, stateId?: string): Observable<{ shippingCost: number }> {
    let url = `${this.apiUrl}/shipping-cost/${countryId}`;
    if (stateId) {
      url += `?stateId=${stateId}`;
    }
    return this.genericApiService.Get(url);
  }
}