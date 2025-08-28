# تحديث نظام حالة المصروفات

## التغييرات المطبقة

### 1. تغيير من `isApproved` إلى `status`

تم تغيير نظام حالة المصروفات من استخدام `isApproved` (boolean) إلى `status` (enum) لتوفير مرونة أكبر في إدارة المصروفات.

#### الحالات الجديدة:
- **PENDING** - في الانتظار
- **APPROVED** - معتمد  
- **REJECTED** - مرفوض
- **PAID** - مدفوع

### 2. التحديثات في Backend

#### مخطط المصروفات (`expense.schema.ts`)
```typescript
// إضافة enum جديد
export enum ExpenseStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED', 
  REJECTED = 'REJECTED',
  PAID = 'PAID'
}

// تغيير الحقل
@Prop({ type: String, enum: ExpenseStatus, default: ExpenseStatus.PENDING })
status: ExpenseStatus;
```

#### DTO للمصروفات (`expense.dto.ts`)
- إضافة `status` إلى `CreateExpenseDto`
- إضافة `status` إلى `UpdateExpenseDto` 
- تحديث `ExpenseQueryDto` لاستخدام `status` بدلاً من `isApproved`

#### خدمة المخزون (`inventory.service.ts`)
- تحديث جميع الاستعلامات لاستخدام `ExpenseStatus.APPROVED` بدلاً من `isApproved: true`

### 3. التحديثات في Frontend

#### واجهة المصروفات (`inventory.service.ts`)
```typescript
export interface Expense {
  // ... other fields
  status: string; // PENDING, APPROVED, REJECTED, PAID
}
```

#### مكون إدارة المصروفات
- تحديث دوال الفلترة لاستخدام الحالات الجديدة
- تحديث دوال عرض الحالة:
  ```typescript
  getStatusColor(status: string): string {
    switch (status) {
      case 'APPROVED': return '#27ae60';
      case 'PENDING': return '#f39c12';
      case 'REJECTED': return '#e74c3c';
      case 'PAID': return '#3498db';
      default: return '#95a5a6';
    }
  }

  getStatusText(status: string): string {
    switch (status) {
      case 'APPROVED': return 'معتمد';
      case 'PENDING': return 'في الانتظار';
      case 'REJECTED': return 'مرفوض';
      case 'PAID': return 'مدفوع';
      default: return status;
    }
  }
  ```

#### قالب HTML
- تحديث قائمة الفلترة لتشمل جميع الحالات الجديدة
- تحديث عرض الحالة في الجدول

## كيفية الاستخدام

### 1. إنشاء مصروف جديد
```typescript
const newExpense = {
  title: 'مصروف جديد',
  amount: 100,
  category: 'UTILITIES',
  paymentMethod: 'CASH',
  status: 'PENDING' // الحالة الافتراضية
};
```

### 2. تحديث حالة مصروف
```typescript
const updateData = {
  status: 'APPROVED' // أو 'REJECTED' أو 'PAID'
};
```

### 3. فلترة المصروفات
```typescript
const query = {
  status: 'APPROVED' // فلترة المصروفات المعتمدة فقط
};
```

## الفوائد من التحديث

1. **مرونة أكبر**: إمكانية إضافة حالات جديدة بسهولة
2. **تحكم أفضل**: فصل واضح بين الحالات المختلفة
3. **تتبع أفضل**: إمكانية تتبع دورة حياة المصروف
4. **تقارير أدق**: إمكانية إنشاء تقارير بناءً على الحالات المختلفة

## ملاحظات مهمة

- جميع المصروفات الموجودة ستكون بحالة `PENDING` افتراضياً
- يمكن تحديث الحالات يدوياً من خلال واجهة الإدارة
- التقارير المالية تستخدم فقط المصروفات بحالة `APPROVED` 