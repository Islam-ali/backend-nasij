import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'PENDING':
        return 'في الانتظار';
      case 'APPROVED':
        return 'معتمد';
      case 'REJECTED':
        return 'مرفوض';
      case 'PAID':
        return 'مدفوع';
      case 'CANCELLED':
        return 'ملغي';
      case 'COMPLETED':
        return 'مكتمل';
      case 'IN_PROGRESS':
        return 'قيد التنفيذ';
      case 'ON_HOLD':
        return 'معلق';
      case 'DRAFT':
        return 'مسودة';
      case 'SUBMITTED':
        return 'مقدم';
      case 'UNDER_REVIEW':
        return 'قيد المراجعة';
      case 'ACTIVE':
        return 'نشط';
      case 'INACTIVE':
        return 'غير نشط';
      case 'SUSPENDED':
        return 'معلق';
      case 'EXPIRED':
        return 'منتهي الصلاحية';
      case 'RENEWED':
        return 'مجدد';
      case 'OVERDUE':
        return 'متأخر';
      case 'PARTIAL':
        return 'جزئي';
      case 'FULL':
        return 'كامل';
      case 'REFUNDED':
        return 'مسترد';
      case 'DISPUTED':
        return 'متنازع عليه';
      case 'RESOLVED':
        return 'محلول';
      default:
        return value;
    }
  }
} 