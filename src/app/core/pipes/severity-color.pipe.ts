import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'severityColor',
  standalone: true
})
export class SeverityColorPipe implements PipeTransform {
  transform(value: string, type: 'category' | 'payment' | 'status' = 'status'): string {
    switch (type) {
      case 'category':
        return this.getCategorySeverity(value);
      case 'payment':
        return this.getPaymentMethodSeverity(value);
      case 'status':
        return this.getStatusSeverity(value);
      default:
        return 'info';
    }
  }

  private getCategorySeverity(category: string): string {
    switch (category) {
      case 'SALES':
        return 'success';
      case 'SHIPPING':
        return 'info';
      case 'DISCOUNT':
        return 'warning';
      case 'OTHER':
        return 'secondary';
      case 'MARKETING':
        return 'primary';
      case 'OPERATIONS':
        return 'info';
      case 'ADMINISTRATION':
        return 'secondary';
      case 'MAINTENANCE':
        return 'warning';
      case 'UTILITIES':
        return 'info';
      case 'INSURANCE':
        return 'primary';
      case 'LEGAL':
        return 'danger';
      case 'TRAVEL':
        return 'info';
      case 'TRAINING':
        return 'primary';
      case 'SOFTWARE':
        return 'info';
      case 'HARDWARE':
        return 'warning';
      case 'OFFICE_SUPPLIES':
        return 'secondary';
      case 'RENT':
        return 'warning';
      case 'SALARY':
        return 'danger';
      case 'BONUS':
        return 'success';
      case 'COMMISSION':
        return 'success';
      default:
        return 'info';
    }
  }

  private getPaymentMethodSeverity(paymentMethod: string): string {
    switch (paymentMethod) {
      case 'CASH':
        return 'success';
      case 'CREDIT_CARD':
        return 'info';
      case 'DEBIT_CARD':
        return 'info';
      case 'PAYPAL':
        return 'warning';
      case 'BANK_TRANSFER':
        return 'secondary';
      case 'CHECK':
        return 'warning';
      case 'MONEY_ORDER':
        return 'warning';
      case 'DIGITAL_WALLET':
        return 'primary';
      case 'CRYPTO':
        return 'danger';
      case 'INVOICE':
        return 'secondary';
      case 'INSTALLMENT':
        return 'warning';
      case 'LOYALTY_POINTS':
        return 'success';
      case 'GIFT_CARD':
        return 'primary';
      case 'VOUCHER':
        return 'info';
      case 'BANK_DEPOSIT':
        return 'info';
      case 'WIRE_TRANSFER':
        return 'secondary';
      case 'MOBILE_PAYMENT':
        return 'primary';
      case 'ONLINE_PAYMENT':
        return 'info';
      case 'POINT_OF_SALE':
        return 'success';
      default:
        return 'info';
    }
  }

  private getStatusSeverity(status: string): string {
    switch (status) {
      case 'PENDING':
        return 'warning';
      case 'APPROVED':
        return 'success';
      case 'REJECTED':
        return 'danger';
      case 'PAID':
        return 'success';
      case 'CANCELLED':
        return 'danger';
      case 'COMPLETED':
        return 'success';
      case 'IN_PROGRESS':
        return 'info';
      case 'ON_HOLD':
        return 'warning';
      case 'DRAFT':
        return 'secondary';
      case 'SUBMITTED':
        return 'info';
      case 'UNDER_REVIEW':
        return 'warning';
      case 'ACTIVE':
        return 'success';
      case 'INACTIVE':
        return 'secondary';
      case 'SUSPENDED':
        return 'warning';
      case 'EXPIRED':
        return 'danger';
      case 'RENEWED':
        return 'success';
      case 'OVERDUE':
        return 'danger';
      case 'PARTIAL':
        return 'warning';
      case 'FULL':
        return 'success';
      case 'REFUNDED':
        return 'info';
      case 'DISPUTED':
        return 'danger';
      case 'RESOLVED':
        return 'success';
      default:
        return 'info';
    }
  }
} 