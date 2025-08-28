# Custom Pipes - الأنابيب المخصصة

## نظرة عامة

تم إنشاء مجموعة من الـ pipes المخصصة لتحسين عرض البيانات في التطبيق وتوحيد تنسيقها.

## الـ Pipes المتاحة

### 1. **DateFormatPipe** - تنسيق التواريخ
```typescript
// الاستخدام
{{ date | dateFormat }}
{{ date | dateFormat:'short' }}
{{ date | dateFormat:'long' }}
{{ date | dateFormat:'time' }}

// الأمثلة
{{ '2025-08-27T23:55:34.217Z' | dateFormat }}
// النتيجة: ٢٧/٨/٢٠٢٥

{{ '2025-08-27T23:55:34.217Z' | dateFormat:'long' }}
// النتيجة: ٢٧ أغسطس ٢٠٢٥

{{ '2025-08-27T23:55:34.217Z' | dateFormat:'time' }}
// النتيجة: ٢٧/٨/٢٠٢٥ ١١:٥٥:٣٤ م
```

### 2. **CurrencyFormatPipe** - تنسيق العملة
```typescript
// الاستخدام
{{ amount | currencyFormat }}
{{ amount | currencyFormat:'USD' }}

// الأمثلة
{{ 440 | currencyFormat }}
// النتيجة: ٤٤٠٫٠٠ ر.س

{{ 1234.56 | currencyFormat }}
// النتيجة: ١٬٢٣٤٫٥٦ ر.س

{{ 0 | currencyFormat }}
// النتيجة: ٠٫٠٠ ر.س
```

### 3. **CategoryLabelPipe** - تسميات الفئات
```typescript
// الاستخدام
{{ category | categoryLabel }}

// الأمثلة
{{ 'SALES' | categoryLabel }}
// النتيجة: المبيعات

{{ 'MARKETING' | categoryLabel }}
// النتيجة: التسويق

{{ 'OPERATIONS' | categoryLabel }}
// النتيجة: العمليات
```

### 4. **PaymentMethodLabelPipe** - تسميات طرق الدفع
```typescript
// الاستخدام
{{ paymentMethod | paymentMethodLabel }}

// الأمثلة
{{ 'CASH' | paymentMethodLabel }}
// النتيجة: نقداً

{{ 'CREDIT_CARD' | paymentMethodLabel }}
// النتيجة: بطاقة ائتمان

{{ 'PAYPAL' | paymentMethodLabel }}
// النتيجة: PayPal
```

### 5. **StatusLabelPipe** - تسميات الحالة
```typescript
// الاستخدام
{{ status | statusLabel }}

// الأمثلة
{{ 'PENDING' | statusLabel }}
// النتيجة: في الانتظار

{{ 'APPROVED' | statusLabel }}
// النتيجة: معتمد

{{ 'PAID' | statusLabel }}
// النتيجة: مدفوع
```

### 6. **SeverityColorPipe** - ألوان الحالة
```typescript
// الاستخدام
{{ value | severityColor:'category' }}
{{ value | severityColor:'payment' }}
{{ value | severityColor:'status' }}

// الأمثلة
{{ 'SALES' | severityColor:'category' }}
// النتيجة: success

{{ 'CASH' | severityColor:'payment' }}
// النتيجة: success

{{ 'PENDING' | severityColor:'status' }}
// النتيجة: warning
```

## الاستخدام في Templates

### مثال كامل في جدول الإيرادات:
```html
<tr class="hover:bg-gray-50">
  <td>{{ revenue.title }}</td>
  
  <td class="font-bold text-green-600">
    {{ revenue.amount | currencyFormat }}
  </td>
  
  <td>
    <p-tag 
      [value]="revenue.category | categoryLabel"
      [severity]="revenue.category | severityColor:'category'">
    </p-tag>
  </td>
  
  <td>
    <p-tag 
      [value]="revenue.paymentMethod | paymentMethodLabel"
      [severity]="revenue.paymentMethod | severityColor:'payment'">
    </p-tag>
  </td>
  
  <td>
    {{ revenue.revenueDate | dateFormat }}
  </td>
</tr>
```

### مثال في البطاقات الإحصائية:
```html
<div class="text-2xl font-bold text-green-600">
  {{ getTotalRevenue() | currencyFormat }}
</div>

<div class="text-2xl font-bold text-purple-600">
  {{ (getTotalRevenue() / revenues.length) || 0 | currencyFormat }}
</div>
```

## الفئات المدعومة

### فئات الإيرادات والمصروفات:
- `SALES` → المبيعات
- `SHIPPING` → الشحن
- `DISCOUNT` → الخصم
- `OTHER` → أخرى
- `MARKETING` → التسويق
- `OPERATIONS` → العمليات
- `ADMINISTRATION` → الإدارة
- `MAINTENANCE` → الصيانة
- `UTILITIES` → المرافق
- `INSURANCE` → التأمين
- `LEGAL` → القانونية
- `TRAVEL` → السفر
- `TRAINING` → التدريب
- `SOFTWARE` → البرمجيات
- `HARDWARE` → الأجهزة
- `OFFICE_SUPPLIES` → مستلزمات المكتب
- `RENT` → الإيجار
- `SALARY` → الرواتب
- `BONUS` → المكافآت
- `COMMISSION` → العمولات

### طرق الدفع:
- `CASH` → نقداً
- `CREDIT_CARD` → بطاقة ائتمان
- `DEBIT_CARD` → بطاقة مدى
- `PAYPAL` → PayPal
- `BANK_TRANSFER` → تحويل بنكي
- `CHECK` → شيك
- `MONEY_ORDER` → أمر دفع
- `DIGITAL_WALLET` → محفظة رقمية
- `CRYPTO` → عملة رقمية
- `INVOICE` → فاتورة
- `INSTALLMENT` → تقسيط
- `LOYALTY_POINTS` → نقاط الولاء
- `GIFT_CARD` → بطاقة هدايا
- `VOUCHER` → قسيمة
- `BANK_DEPOSIT` → إيداع بنكي
- `WIRE_TRANSFER` → تحويل سريع
- `MOBILE_PAYMENT` → دفع محمول
- `ONLINE_PAYMENT` → دفع إلكتروني
- `POINT_OF_SALE` → نقطة بيع

### الحالات:
- `PENDING` → في الانتظار
- `APPROVED` → معتمد
- `REJECTED` → مرفوض
- `PAID` → مدفوع
- `CANCELLED` → ملغي
- `COMPLETED` → مكتمل
- `IN_PROGRESS` → قيد التنفيذ
- `ON_HOLD` → معلق
- `DRAFT` → مسودة
- `SUBMITTED` → مقدم
- `UNDER_REVIEW` → قيد المراجعة
- `ACTIVE` → نشط
- `INACTIVE` → غير نشط
- `SUSPENDED` → معلق
- `EXPIRED` → منتهي الصلاحية
- `RENEWED` → مجدد
- `OVERDUE` → متأخر
- `PARTIAL` → جزئي
- `FULL` → كامل
- `REFUNDED` → مسترد
- `DISPUTED` → متنازع عليه
- `RESOLVED` → محلول

## الألوان المستخدمة

### PrimeNG Severity Colors:
- `success` → أخضر (للحالات الإيجابية)
- `info` → أزرق (للمعلومات)
- `warning` → برتقالي (للتحذيرات)
- `danger` → أحمر (للأخطاء)
- `secondary` → رمادي (للحالات الثانوية)
- `primary` → أزرق داكن (للعناصر الأساسية)

## المزايا

### ✅ **إعادة الاستخدام**
- يمكن استخدام الـ pipes في أي component
- لا حاجة لكتابة نفس الكود مراراً

### ✅ **التوحيد**
- تنسيق موحد للبيانات في جميع أنحاء التطبيق
- سهولة تغيير التنسيق من مكان واحد

### ✅ **الأداء**
- الـ pipes محسنة للأداء
- تعمل فقط عند تغيير البيانات

### ✅ **سهولة الصيانة**
- كود نظيف ومنظم
- سهولة إضافة فئات أو حالات جديدة

### ✅ **دعم اللغة العربية**
- تنسيق التواريخ باللغة العربية
- تسميات عربية للفئات والحالات

## كيفية إضافة Pipe جديد

### 1. إنشاء الملف:
```typescript
// src/app/core/pipes/new-pipe.pipe.ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'newPipe',
  standalone: true
})
export class NewPipePipe implements PipeTransform {
  transform(value: any): any {
    // منطق التحويل
    return transformedValue;
  }
}
```

### 2. إضافة إلى index.ts:
```typescript
// src/app/core/pipes/index.ts
export * from './new-pipe.pipe';
```

### 3. استخدام في Component:
```typescript
// في component
import { NewPipePipe } from '../../../../core/pipes';

@Component({
  imports: [NewPipePipe],
  // ...
})
```

### 4. استخدام في Template:
```html
{{ value | newPipe }}
```

## الخلاصة

الـ pipes المخصصة توفر:
- تنسيق موحد للبيانات
- دعم كامل للغة العربية
- سهولة الاستخدام والصيانة
- أداء محسن
- إعادة استخدام فعالة

يمكن استخدام هذه الـ pipes في جميع أنحاء التطبيق لضمان تنسيق موحد ومهني للبيانات. 