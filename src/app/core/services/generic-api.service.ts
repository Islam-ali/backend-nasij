import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

function toHttpParams(params?: Record<string, any>): HttpParams {
  let httpParams = new HttpParams();
  if (params) {
    Object.keys(params).forEach(key => {
      const value = params[key];
      if (value !== null && value !== undefined) {
        httpParams = httpParams.set(key, value);
      }
    });
  }
  return httpParams;
}

@Injectable({
  providedIn: 'root'
})
export class GenericApiService<T> {
  constructor(private http: HttpClient) {}

  Get(endpoint: string, queryParams?: Record<string, any>): Observable<T> {
    const params = toHttpParams(queryParams);
    return this.http.get<T>(endpoint, { params });
  }

  Post(endpoint: string, body: T, queryParams?: Record<string, any>): Observable<T> {
    const params = toHttpParams(queryParams);
    return this.http.post<T>(endpoint, body, { params });
  }

  Put(endpoint: string, id: number | string, body: Partial<T>, queryParams?: Record<string, any>): Observable<T> {
    const params = toHttpParams(queryParams);
    return this.http.put<T>(`${endpoint}/${id}`, body, { params });
  }

  Patch(endpoint: string, id: number | string, body: Partial<T>, queryParams?: Record<string, any>): Observable<T> {
    const params = toHttpParams(queryParams);
    return this.http.patch<T>(`${endpoint}/${id}`, body, { params });
  }

  Delete(endpoint: string, id: number | string): Observable<T> {
    return this.http.delete<T>(`${endpoint}/${id}`);
  }
}
