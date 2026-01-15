import { HttpClient } from '@angular/common/http';
import { Inject, PLATFORM_ID } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { isPlatformBrowser } from '@angular/common';

export class HttpLoaderFactory implements TranslateLoader {
  constructor(
    private http: HttpClient,
    @Inject(PLATFORM_ID) private platformId: Object,
    private prefix: string = '/assets/i18n/',
    private suffix: string = '.json'
  ) {}

  getTranslation(lang: string): Observable<any> {
    const url = `${this.prefix}${lang}${this.suffix}`;
    return this.http.get(url).pipe(
      catchError((error) => {
        return of({});
      })
    );
  }
}

export function translateLoaderFactory(http: HttpClient, platformId: Object): TranslateLoader {
  return new HttpLoaderFactory(http, platformId, '/assets/i18n/', '.json');
}
