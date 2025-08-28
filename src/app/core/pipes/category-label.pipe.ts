import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'categoryLabel',
  standalone: true
})
export class CategoryLabelPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'SALES':
        return 'المبيعات';
      case 'SHIPPING':
        return 'الشحن';
      case 'DISCOUNT':
        return 'الخصم';
      case 'OTHER':
        return 'أخرى';
      case 'MARKETING':
        return 'التسويق';
      case 'OPERATIONS':
        return 'العمليات';
      case 'ADMINISTRATION':
        return 'الإدارة';
      case 'MAINTENANCE':
        return 'الصيانة';
      case 'UTILITIES':
        return 'المرافق';
      case 'INSURANCE':
        return 'التأمين';
      case 'LEGAL':
        return 'القانونية';
      case 'TRAVEL':
        return 'السفر';
      case 'TRAINING':
        return 'التدريب';
      case 'SOFTWARE':
        return 'البرمجيات';
      case 'HARDWARE':
        return 'الأجهزة';
      case 'OFFICE_SUPPLIES':
        return 'مستلزمات المكتب';
      case 'RENT':
        return 'الإيجار';
      case 'SALARY':
        return 'الرواتب';
      case 'BONUS':
        return 'المكافآت';
      case 'COMMISSION':
        return 'العمولات';
      default:
        return value;
    }
  }
} 