import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { GenericApiService } from '../core/services/generic-api.service';
import { CommonService } from '../core/services/common.service';
import { BaseResponse } from '../core/models/baseResponse';
import { IMenuLink, MenuLinkStatus } from '../interfaces/menu-link.interface';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class MenuLinkService {
  private apiUrl = `${environment.apiUrl}/menu-links`;

  constructor(
    private genericApiService: GenericApiService<any>,
    private commonService: CommonService
  ) {}

  getMenuLinks(status?: MenuLinkStatus): Observable<BaseResponse<IMenuLink[]>> {
    const params = status ? { status } : {};
    return this.genericApiService.Get(this.apiUrl, params);
  }

  getActiveMenuLinks(): Observable<BaseResponse<IMenuLink[]>> {
    return this.genericApiService.Get(`${this.apiUrl}/active`);
  }

  getMenuLink(id: string): Observable<BaseResponse<IMenuLink>> {
    return this.genericApiService.Get(`${this.apiUrl}/${id}`);
  }

  createMenuLink(menuLink: IMenuLink): Observable<BaseResponse<IMenuLink>> {
    return this.genericApiService.Post(
      this.apiUrl,
      this.commonService.removeNullUndefinedEmptyStringKeys(menuLink)
    );
  }

  updateMenuLink(id: string, menuLink: IMenuLink): Observable<BaseResponse<IMenuLink>> {
    return this.genericApiService.Patch(
      `${this.apiUrl}/${id}`,
      this.commonService.removeNullUndefinedEmptyStringKeysAndId(menuLink)
    );
  }

  deleteMenuLink(id: string): Observable<BaseResponse<any>> {
    return this.genericApiService.Delete(this.apiUrl, id);
  }

  reorderMenuLinks(ids: string[]): Observable<BaseResponse<void>> {
    return this.genericApiService.Post(`${this.apiUrl}/reorder`, { ids });
  }
}

