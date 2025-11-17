import { Pipe, PipeTransform, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Pipe({
  name: 'currency',
  standalone: true,
  pure: false
})
export class CurrencyFormatPipe implements PipeTransform {

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  transform(value: number | string | null | undefined): string {
    // Handle null, undefined, or empty values
    if (value === null || value === undefined || value === '') {
      return '0';
    }

    // Convert to number if string
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    
    // Check if valid number
    if (isNaN(numValue)) {
      return '0';
    }

    // Format number with 2 decimal places and thousands separator
    const formattedNumber = numValue.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });

    // Get current language
    let currentLang = 'en';
    // if (isPlatformBrowser(this.platformId)) {
    //   currentLang = localStorage.getItem('pledge-language') || 'ar';
    // }

    // Return formatted value with currency symbol based on language
    if (currentLang === 'ar') {
      return `${formattedNumber} ج.م`;
    } else {
      return `${formattedNumber} EGP`;
    }
  }

}
