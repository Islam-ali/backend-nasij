import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IState } from '../interfaces/state.interface';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse } from '../core/models/baseResponse';


@Injectable({
  providedIn: 'root'
})
export class StateService {
  private readonly apiUrl = `${environment.apiUrl}/states`;

  constructor(private genericApiService: GenericApiService<any>) {}

  // Get all states
  getStates(): Observable<BaseResponse<IState[]>> {
    return this.genericApiService.Get(this.apiUrl);
  }

  // Get states by country
  getStatesByCountry(countryId: string): Observable<BaseResponse<IState[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/country/${countryId}`);
  }

  // Get state by ID
  getState(id: string): Observable<BaseResponse<IState>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  // Create new state
  createState(state: Partial<IState>): Observable<BaseResponse<IState>> {
    return this.genericApiService.Post(this.apiUrl, state);
  }

  // Bulk create states
  bulkCreateStates(states: Partial<IState>[]): Observable<BaseResponse<{ states: IState[], pagination: any }>> {
    return this.genericApiService.Post(`${this.apiUrl}/bulk`, states);
  }

  // Update state
  updateState(id: string, state: Partial<IState>): Observable<BaseResponse<IState>> {
    return this.genericApiService.Patch(this.apiUrl, id, state);
  }

  // Delete state
  deleteState(id: string, soft: boolean = false): Observable<BaseResponse<void>> {
    return this.genericApiService.Delete(this.apiUrl, id);
  }

}