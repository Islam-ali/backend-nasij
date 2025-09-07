import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { User, CreateUserDto, UpdateUserDto, UserFilters, UserListResponse } from '../interfaces/user.interface';
import { CommonService } from '../core/services/common.service';
import { GenericApiService } from '../core/services/generic-api.service';
import { BaseResponse } from '../core/models/baseResponse';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private apiUrl = `${environment.apiUrl}/users`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  getUsers(filters?: UserFilters): Observable<BaseResponse<UserListResponse>> {
    return this.genericApiService.Get(this.apiUrl, filters);
  }

  getUsersList(): Observable<BaseResponse<User[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/list`);
  }

  getUser(id: string): Observable<BaseResponse<User>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  createUser(userData: CreateUserDto): Observable<BaseResponse<User>> {
    return this.genericApiService.Post(
      this.apiUrl, 
      this.commonService.removeNullUndefinedEmptyStringKeys(userData)
    );
  }

  updateUser(id: string, userData: UpdateUserDto): Observable<BaseResponse<User>> {
    return this.genericApiService.Patch(
      this.apiUrl, 
      id, 
      this.commonService.removeNullUndefinedEmptyStringKeysAndId(userData)
    );
  }

  deleteUser(id: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Delete(this.apiUrl, id);
  }

  updateUserStatus(id: string, isActive: boolean): Observable<BaseResponse<any>> {
    return this.genericApiService.Patch(this.apiUrl, id, { isActive });
  }

  updateUserRole(id: string, role: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Patch(this.apiUrl, id, { role });
  }

  searchUsers(searchTerm: string): Observable<BaseResponse<User[]>> {
    return this.genericApiService.Get(this.apiUrl, { search: searchTerm });
  }

  getUsersByRole(role: string): Observable<BaseResponse<User[]>> {
    return this.genericApiService.Get(this.apiUrl, { role });
  }

  getActiveUsers(): Observable<BaseResponse<User[]>> {
    return this.genericApiService.Get(this.apiUrl, { isActive: true });
  }

  getUserProfile(): Observable<BaseResponse<User>> {
    return this.genericApiService.Get(`${this.apiUrl}/profile`);
  }

  // updateUserProfile(userData: UpdateUserDto): Observable<BaseResponse<User>> {
  //   return this.genericApiService.Patch(`${this.apiUrl}/profile`, userData, userData);
  // }

  changePassword(oldPassword: string, newPassword: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Post(`${this.apiUrl}/change-password`, {
      oldPassword,
      newPassword
    });
  }

  resetPassword(email: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Post(`${this.apiUrl}/reset-password`, { email });
  }

  verifyEmail(token: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Post(`${this.apiUrl}/verify-email`, { token });
  }

  resendVerificationEmail(email: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Post(`${this.apiUrl}/resend-verification`, { email });
  }
}
