import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Coupon } from '../interfaces/coupon.interface';

@Injectable({
  providedIn: 'root'
})
export class CouponsService {
  private apiUrl = '/api/coupons';

  constructor(private http: HttpClient) {}

  getCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.apiUrl);
  }

  getCoupon(code: string): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.apiUrl}/${code}`);
  }

  createCoupon(coupon: Coupon): Observable<Coupon> {
    return this.http.post<Coupon>(this.apiUrl, coupon);
  }

  updateCoupon(code: string, coupon: Coupon): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.apiUrl}/${code}`, coupon);
  }

  deleteCoupon(code: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${code}`);
  }

  validateCoupon(code: string, orderTotal: number, categories: string[]): Observable<boolean> {
    return this.http.post<boolean>(`${this.apiUrl}/validate`, { code, orderTotal, categories });
  }
}
