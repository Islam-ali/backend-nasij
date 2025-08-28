import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'paymentMethodLabel',
  standalone: true
})
export class PaymentMethodLabelPipe implements PipeTransform {
  transform(value: string): string {
    switch (value) {
      case 'CASH':
        return 'نقداً';
      case 'CREDIT_CARD':
        return 'بطاقة ائتمان';
      case 'DEBIT_CARD':
        return 'بطاقة مدى';
      case 'PAYPAL':
        return 'PayPal';
      case 'BANK_TRANSFER':
        return 'تحويل بنكي';
      case 'CHECK':
        return 'شيك';
      case 'MONEY_ORDER':
        return 'أمر دفع';
      case 'DIGITAL_WALLET':
        return 'محفظة رقمية';
      case 'CRYPTO':
        return 'عملة رقمية';
      case 'INVOICE':
        return 'فاتورة';
      case 'INSTALLMENT':
        return 'تقسيط';
      case 'LOYALTY_POINTS':
        return 'نقاط الولاء';
      case 'GIFT_CARD':
        return 'بطاقة هدايا';
      case 'VOUCHER':
        return 'قسيمة';
      case 'BANK_DEPOSIT':
        return 'إيداع بنكي';
      case 'WIRE_TRANSFER':
        return 'تحويل سريع';
      case 'MOBILE_PAYMENT':
        return 'دفع محمول';
      case 'ONLINE_PAYMENT':
        return 'دفع إلكتروني';
      case 'POINT_OF_SALE':
        return 'نقطة بيع';
      default:
        return value;
    }
  }
} 