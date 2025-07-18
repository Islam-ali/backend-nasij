import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpEvent, HttpRequest } from '@angular/common/http';
import { HttpClient } from '@angular/common/http';
import { BaseResponse } from '../../../../core/models/baseResponse';
import { Archived } from '../models/Archived';
@Injectable({
  providedIn: 'root'
})
export class UploadFilesService {

  constructor(private http: HttpClient ) { }

  PostImageFile(form:{file: File , folderName: string}): Observable<HttpEvent<BaseResponse<Archived>>> {
    const formData = new FormData();
    formData.append('file', form.file);
    formData.append('folderName', form.folderName);

    const req = new HttpRequest('POST', `http://localhost:3000/api/v1/file-upload`, formData, {
      reportProgress: true,
      responseType: 'json'
    });
    
    return this.http.request(req);
  }
}
