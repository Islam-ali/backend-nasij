import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericApiService } from '../core/services/generic-api.service';
import { CommonService } from '../core/services/common.service';
import { IReview } from '../interfaces/review.interface';
import { BaseResponse } from '../core/models/baseResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ReviewService {
  private apiUrl = `${environment.apiUrl}/reviews`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  // Get all reviews with optional filters
  getReviews(queryParams?: any): Observable<BaseResponse<IReview[]>> {
    return this.genericApiService.Get(this.apiUrl, queryParams);
  }

  // Get active reviews
  getActiveReviews(): Observable<BaseResponse<IReview[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/active`);
  }

  // Get pinned reviews
  getPinnedReviews(): Observable<BaseResponse<IReview[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/pinned`);
  }

  // Get review by ID
  getReviewById(id: string): Observable<BaseResponse<IReview>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  // Create a new review
  createReview(review: IReview): Observable<BaseResponse<IReview>> {
    return this.genericApiService.Post(this.apiUrl, this.commonService.removeNullUndefinedEmptyStringKeys(review));
  }

  // Update a review
  updateReview(id: string, review: IReview): Observable<BaseResponse<IReview>> {
    return this.genericApiService.Patch(`${this.apiUrl}/${id}`, this.commonService.removeNullUndefinedEmptyStringKeysAndId(review));
  }

  // Delete a review
  deleteReview(id: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Delete(this.apiUrl, id);
  }

  // Update review order
  updateReviewOrder(id: string, order: number): Observable<BaseResponse<IReview>> {
    return this.genericApiService.Patch(`${this.apiUrl}/${id}/order`, { order });
  }
}

