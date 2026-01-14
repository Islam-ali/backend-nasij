import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DropdownModule } from 'primeng/dropdown';
import { FormsModule } from '@angular/forms';
import { isPlatformBrowser } from '@angular/common';
import { TranslationService } from '../../../core/services/translate.service';

interface LanguageOption {
  label: string;
  value: string;
  flag?: string;
}

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslateModule, DropdownModule, FormsModule],
  template: `
    <p-dropdown
      [options]="languageOptions"
      [(ngModel)]="selectedLanguage"
      optionLabel="label"
      optionValue="value"
      (onChange)="onLanguageChange($event)"
      [style]="{ width: '140px' }"
      [showClear]="false"
      placeholder="Language">
      <ng-template let-option pTemplate="item">
        <div class="flex align-items-center gap-2">
          <span *ngIf="option.flag">{{ option.flag }}</span>
          <span>{{ option.label }}</span>
        </div>
      </ng-template>
      <ng-template let-option pTemplate="selectedItem">
        <div class="flex align-items-center gap-2">
          <span *ngIf="option.flag">{{ option.flag }}</span>
          <span>{{ option.label }}</span>
        </div>
      </ng-template>
    </p-dropdown>
  `,
  styles: [`
    :host {
      display: block;
    }
  `]
})
export class LanguageSwitcherComponent implements OnInit {
  selectedLanguage: string = 'ar';
  languageOptions: LanguageOption[] = [];

  constructor(
    private translationService: TranslationService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.selectedLanguage = this.translationService.getCurrentLanguage();
      this.initializeLanguageOptions();
    }
  }

  private initializeLanguageOptions(): void {
    const supportedLanguages = this.translationService.getSupportedLanguages();
    const flagMap: { [key: string]: string } = {
      'en': '🇬🇧',
      'ar': '🇸🇦'
    };
    
    this.languageOptions = supportedLanguages.map(lang => ({
      label: this.translationService.getLanguageDisplayName(lang),
      value: lang,
      flag: flagMap[lang] || '🌐'
    }));
  }

  onLanguageChange(event: any): void {
    if (event.value) {
      this.selectedLanguage = event.value;
      this.translationService.setLanguage(event.value);
    }
  }
}
