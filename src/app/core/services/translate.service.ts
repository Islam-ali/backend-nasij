import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private readonly defaultLanguage = 'ar';
  private readonly supportedLanguages = ['ar', 'en'];

  constructor(
    private translate: TranslateService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Set default language immediately
    this.translate.setDefaultLang(this.defaultLanguage);
    
    // Subscribe to language changes to update direction
    if (isPlatformBrowser(this.platformId)) {
      this.translate.onLangChange.subscribe((event) => {
        this.updateDocumentDirection(event.lang);
      });
      
      // Initialize language from localStorage
      const savedLang = localStorage.getItem('lang-store');
      if (savedLang && this.supportedLanguages.includes(savedLang)) {
        this.translate.use(savedLang);
        this.updateDocumentDirection(savedLang);
      } else {
        this.translate.use(this.defaultLanguage);
        this.updateDocumentDirection(this.defaultLanguage);
      }
    }
  }

  private updateDocumentDirection(lang: string): void {
    if (isPlatformBrowser(this.platformId)) {
      const html = document.documentElement;
      html.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
      html.setAttribute('lang', lang);
    }
  }

  setLanguage(language: string): void {
    if (this.supportedLanguages.includes(language)) {
      this.translate.use(language);
      if (isPlatformBrowser(this.platformId)) {
        localStorage.setItem('lang-store', language);
        this.updateDocumentDirection(language);
      }
    }
  }

  getCurrentLanguage(): string {
    return this.translate.currentLang || this.defaultLanguage;
  }

  getSupportedLanguages(): string[] {
    return this.supportedLanguages;
  }

  getLanguageDisplayName(lang: string): string {
    const names: { [key: string]: string } = {
      'ar': 'العربية',
      'en': 'English'
    };
    return names[lang] || lang;
  }
}
