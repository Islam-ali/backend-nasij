# إصلاح مشاكل حالة المصروفات

## المشاكل التي تم حلها

### 1. مشكلة "property status should not exist"

**المشكلة**: كان `status` موجود في `CreateExpenseDto` مما يسبب خطأ في التحقق من الصحة.

**الحل**: 
- إزالة `status` من `CreateExpenseDto` لأنه سيتم تعيينه تلقائياً
- إضافة منطق في `createExpense` لتعيين الحالة الافتراضية:

```typescript
// في inventory.service.ts
async createExpense(createDto: CreateExpenseDto, userId?: string): Promise<Expense> {
  const expense = new this.expenseModel({
    ...createDto,
    status: ExpenseStatus.PENDING, // تعيين الحالة الافتراضية
    createdBy: userId ? new Types.ObjectId(userId) : undefined,
  });

  return expense.save();
}
```

### 2. مشكلة "not work filter in backend"

**المشكلة**: الفلاتر لا تعمل بشكل صحيح في Backend.

**الحل**: 
- تحديث `ExpenseQueryDto` لاستخدام `status` بدلاً من `isApproved`
- تحديث منطق الفلترة في `getExpenses`:

```typescript
// في inventory.service.ts
const filterQuery: any = {};
if (filters.category) filterQuery.category = filters.category;
if (filters.paymentMethod) filterQuery.paymentMethod = filters.paymentMethod;
if (filters.isRecurring !== undefined) filterQuery.isRecurring = filters.isRecurring;
if (filters.status !== undefined) filterQuery.status = filters.status; // تم إصلاحه
```

### 3. إضافة تعديل الحالة في Frontend

**المشكلة**: لا يمكن تعديل حالة المصروف من الواجهة الأمامية.

**الحل**:
- إضافة `statusOptions` إلى المكون
- إضافة حقل `status` إلى النموذج
- إضافة حقل الحالة في نموذج التعديل فقط

```typescript
// في expense-management.component.ts
statusOptions = [
  { value: 'PENDING', label: 'في الانتظار' },
  { value: 'APPROVED', label: 'معتمد' },
  { value: 'REJECTED', label: 'مرفوض' },
  { value: 'PAID', label: 'مدفوع' }
];

// إضافة إلى النموذج
initForm(): void {
  this.expenseForm = this.fb.group({
    // ... الحقول الأخرى
    status: ['PENDING'], // إضافة حقل الحالة
  });
}
```

## التحديثات المطبقة

### Backend
1. **expense.schema.ts**: إضافة `ExpenseStatus` enum
2. **expense.dto.ts**: إزالة `status` من `CreateExpenseDto`، إضافته إلى `UpdateExpenseDto`
3. **inventory.service.ts**: تحديث منطق إنشاء المصروفات والفلاتر

### Frontend
1. **inventory.service.ts**: تحديث واجهة `Expense`
2. **expense-management.component.ts**: إضافة خيارات الحالة والنموذج
3. **expense-management.component.html**: إضافة حقل الحالة في نموذج التعديل

## كيفية الاستخدام

### 1. إنشاء مصروف جديد
```typescript
const newExpense = {
  title: 'مصروف جديد',
  amount: 100,
  category: 'UTILITIES',
  paymentMethod: 'CASH',
  // status سيتم تعيينه تلقائياً كـ PENDING
};
```

### 2. تعديل حالة مصروف
```typescript
// في نموذج التعديل، يمكن تغيير الحالة من القائمة المنسدلة
const updateData = {
  status: 'APPROVED' // أو 'REJECTED' أو 'PAID'
};
```

### 3. فلترة المصروفات
```typescript
// في الواجهة الأمامية
const query = {
  status: 'APPROVED' // فلترة المصروفات المعتمدة فقط
};
```

## اختبار النظام

### 1. اختبار إنشاء مصروف جديد
- انتقل إلى صفحة إدارة المصروفات
- اضغط على "إضافة مصروف جديد"
- املأ البيانات المطلوبة
- احفظ المصروف
- تأكد من أن الحالة تظهر كـ "في الانتظار"

### 2. اختبار تعديل الحالة
- اضغط على أيقونة التعديل لأي مصروف
- غيّر الحالة من القائمة المنسدلة
- احفظ التعديلات
- تأكد من تحديث الحالة في الجدول

### 3. اختبار الفلاتر
- استخدم فلتر الحالة لفلترة المصروفات
- تأكد من ظهور النتائج الصحيحة
- جرب الفلاتر الأخرى (التاريخ، الفئة، إلخ)

## ملاحظات مهمة

1. **الحالة الافتراضية**: جميع المصروفات الجديدة ستكون بحالة `PENDING`
2. **التعديل فقط**: يمكن تعديل الحالة فقط من نموذج التعديل، وليس من نموذج الإضافة
3. **التقارير**: التقارير المالية تستخدم فقط المصروفات بحالة `APPROVED`
4. **الألوان**: كل حالة لها لون مميز في الواجهة 