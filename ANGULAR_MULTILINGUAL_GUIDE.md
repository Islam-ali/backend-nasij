# دليل النظام متعدد اللغات في Angular Dashboard

## نظرة عامة

تم تحديث نظام البانرز في Angular Dashboard لدعم اللغة العربية والإنجليزية مع إمكانية التبديل بين اللغات في الواجهة.

## الميزات الجديدة

### 1. واجهة متعددة اللغات
- **اختيار اللغة**: dropdown في أعلى الصفحة للتبديل بين الإنجليزية والعربية
- **عرض ديناميكي**: جميع النصوص تتغير حسب اللغة المختارة
- **نموذج مزدوج**: إدخال النصوص باللغتين في نفس الوقت

### 2. تحديثات البيانات
- **MultilingualText Interface**: دعم كامل للنصوص متعددة اللغات
- **Form Validation**: التحقق من صحة البيانات لكل لغة
- **Real-time Display**: عرض فوري للغة المختارة

## كيفية الاستخدام

### 1. عرض البانرز
```html
<!-- عرض النص حسب اللغة المختارة -->
<div class="font-semibold">{{ getMultilingualText(banner.title) }}</div>
<div class="text-sm text-gray-500">{{ getMultilingualText(banner.description) }}</div>
```

### 2. إدخال البيانات
```html
<!-- نموذج مزدوج للغتين -->
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label>Title (English) *</label>
        <input formControlName="title.en" placeholder="e.g., Get 50% Off" />
    </div>
    <div>
        <label>Title (Arabic) *</label>
        <input formControlName="title.ar" placeholder="e.g., احصل على خصم 50%" />
    </div>
</div>
```

### 3. التبديل بين اللغات
```html
<!-- Language Selector -->
<p-dropdown [options]="languages()" 
           [ngModel]="currentLanguage()"
           (onChange)="onLanguageChange($event)"
           optionLabel="label" 
           optionValue="value">
</p-dropdown>
```

## التحديثات المطبقة

### 1. Interfaces
```typescript
export interface MultilingualText {
  en: string;
  ar: string;
}

export interface Banner {
  tag: MultilingualText;
  title: MultilingualText;
  description: MultilingualText;
  buttons: BannerButton[];
}

export interface BannerButton {
  label: MultilingualText;
  url: string;
  params?: Record<string, string>;
}
```

### 2. Component Updates
```typescript
export class BannerListComponent {
  currentLanguage = signal<SupportedLanguage>('en');
  languages = signal([
    { label: 'English', value: 'en' },
    { label: 'العربية', value: 'ar' }
  ]);

  // Helper methods
  getMultilingualText(text: MultilingualText): string {
    return text[this.currentLanguage()] || text.en || '';
  }

  onLanguageChange(event: any) {
    this.currentLanguage.set(event.value);
  }
}
```

### 3. Form Structure
```typescript
initForm() {
  this.bannerForm = this.fb.group({
    tag: this.fb.group({
      en: ['', [Validators.required]],
      ar: ['', [Validators.required]]
    }),
    title: this.fb.group({
      en: ['', [Validators.required]],
      ar: ['', [Validators.required]]
    }),
    description: this.fb.group({
      en: ['', [Validators.required]],
      ar: ['', [Validators.required]]
    }),
    // ... other fields
  });
}
```

## التطبيق على باقي المكونات

يمكن تطبيق نفس النمط على باقي المكونات:

### 1. تحديث الـ Interface
```typescript
// من
interface Product {
  name: string;
  description: string;
}

// إلى
interface Product {
  name: MultilingualText;
  description: MultilingualText;
}
```

### 2. تحديث الـ Form
```typescript
initForm() {
  this.form = this.fb.group({
    name: this.fb.group({
      en: ['', [Validators.required]],
      ar: ['', [Validators.required]]
    }),
    description: this.fb.group({
      en: ['', [Validators.required]],
      ar: ['', [Validators.required]]
    })
  });
}
```

### 3. تحديث الـ Template
```html
<div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
        <label>Name (English) *</label>
        <input formControlName="name.en" />
    </div>
    <div>
        <label>Name (Arabic) *</label>
        <input formControlName="name.ar" />
    </div>
</div>
```

## أمثلة عملية

### 1. إنشاء بانر جديد
1. اختر اللغة من الـ dropdown
2. املأ النموذج باللغتين
3. احفظ البانر

### 2. تعديل بانر موجود
1. اضغط على أيقونة التعديل
2. سيتم تحميل البيانات باللغتين
3. عدل النصوص المطلوبة
4. احفظ التغييرات

### 3. عرض البانرز
- **اللغة الإنجليزية**: عرض النصوص الإنجليزية
- **اللغة العربية**: عرض النصوص العربية مع دعم RTL

## نصائح للتطوير

1. **استخدم Helper Methods**: استخدم `getMultilingualText()` لعرض النصوص
2. **Form Validation**: تأكد من التحقق من صحة البيانات لكل لغة
3. **UI Consistency**: حافظ على نفس التخطيط للغتين
4. **RTL Support**: أضف دعم RTL للعربية إذا لزم الأمر
5. **Default Language**: استخدم الإنجليزية كلغة افتراضية

## المكونات المحدثة

- ✅ `banner.interface.ts` - دعم متعدد اللغات
- ✅ `banner-list.component.ts` - منطق متعدد اللغات
- ✅ `banner-list.component.html` - واجهة متعددة اللغات
- ✅ Form validation - التحقق من كل لغة
- ✅ Language selector - اختيار اللغة
- ✅ Display methods - عرض ديناميكي

النظام الآن جاهز للاستخدام مع دعم كامل للغة العربية والإنجليزية! 🎉