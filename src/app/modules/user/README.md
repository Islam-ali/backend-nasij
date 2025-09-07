# User Module - Dashboard Integration

## نظرة عامة
User Module يوفر واجهة إدارية كاملة لإدارة المستخدمين في pledge dashboard، مع إمكانية إنشاء وتعديل وحذف المستخدمين وعرض تفاصيلهم.

## المكونات

### 1. User List Component
- **الملف**: `user-list/user-list.component.ts`
- **الوظيفة**: عرض قائمة جميع المستخدمين مع إمكانية:
  - إنشاء مستخدم جديد
  - تعديل المستخدمين الموجودة
  - حذف المستخدمين
  - البحث والفلترة
  - إدارة الحالة (Active/Inactive)
  - إدارة الأدوار (Admin/Manager/Customer)

### 2. User Detail Component
- **الملف**: `user-detail/user-detail.component.ts`
- **الوظيفة**: عرض تفاصيل كاملة للمستخدم مع:
  - معلومات المستخدم الأساسية
  - التفضيلات والإعدادات
  - العناوين
  - سجل النشاط
  - إعدادات الحساب

### 3. Users Service
- **الملف**: `users.service.ts`
- **الوظيفة**: التواصل مع API للعمليات التالية:
  - CRUD operations للمستخدمين
  - إدارة الحالة والأدوار
  - البحث والفلترة
  - إدارة الملف الشخصي
  - تغيير كلمة المرور

## الاستخدام

### إضافة User Module للـ App Routes
```typescript
// app.routes.ts
{
  path: 'users',
  loadChildren: () => import('./modules/user/user.module').then(m => m.UserModule)
}
```

### استخدام Users Service
```typescript
import { UsersService } from './services/users.service';

constructor(private usersService: UsersService) {}

// الحصول على جميع المستخدمين
this.usersService.getUsers().subscribe(response => {
  if (response.success) {
    this.users = response.data.users;
  }
});

// إنشاء مستخدم جديد
this.usersService.createUser(userData).subscribe(response => {
  if (response.success) {
    console.log('User created successfully');
  }
});
```

### استخدام User Components
```html
<!-- User List -->
<app-user-list></app-user-list>

<!-- User Detail -->
<app-user-detail [userId]="'user-id'"></app-user-detail>
```

## الميزات

### User List Features
- ✅ عرض المستخدمين في جدول منظم
- ✅ إمكانية تحديد متعدد للمستخدمين
- ✅ البحث في الاسم والبريد الإلكتروني
- ✅ فلترة حسب الدور والحالة
- ✅ إدارة الحالة (تفعيل/إلغاء تفعيل)
- ✅ إضافة/تعديل/حذف المستخدمين
- ✅ عرض معلومات العناوين

### User Detail Features
- ✅ عرض معلومات شاملة للمستخدم
- ✅ نظام تبويب منظم (Overview, Addresses, Activity, Settings)
- ✅ معرض العناوين مع تحديد العنوان الافتراضي
- ✅ سجل النشاط الزمني
- ✅ إعدادات الحساب والتفضيلات
- ✅ إدارة الحالة والدور

### Form Features
- ✅ نموذج إنشاء/تعديل متقدم
- ✅ إدارة العناوين المتعددة
- ✅ تحديد العنوان الافتراضي
- ✅ إدارة التفضيلات (اللغة، المنطقة الزمنية، الإشعارات)
- ✅ التحقق من صحة البيانات
- ✅ إدارة كلمة المرور

## التكامل مع PrimeNG

### Components المستخدمة
- `p-table` - لعرض البيانات
- `p-dialog` - للنماذج
- `p-card` - لعرض المعلومات
- `p-tag` - لعرض الحالات
- `p-button` - للأزرار
- `p-dropdown` - لاختيار الأدوار
- `p-toggleSwitch` - لحالة المستخدم
- `p-tabView` - لعرض المعلومات في تبويبات
- `p-skeleton` - لعرض حالة التحميل

### Styling
- استخدام PrimeNG themes
- تخصيص CSS للتصميم
- Responsive design
- Consistent UI/UX
- Timeline design للنشاط
- Card-based layout

## الأمان

### Authentication
- جميع العمليات تتطلب تسجيل دخول
- التحقق من الصلاحيات
- إدارة الأدوار

### Validation
- التحقق من صحة البيانات في Frontend
- التحقق من صحة البيانات في Backend
- رسائل خطأ واضحة
- التحقق من صحة البريد الإلكتروني

## الأداء

### Optimization
- Lazy loading للـ components
- Pagination للقوائم الكبيرة
- Debounced search
- Efficient data loading
- Skeleton loading states

### Caching
- Cache للبيانات المتكررة
- Optimistic updates
- Error handling

## التطوير المستقبلي

### الميزات المقترحة
- [ ] Bulk operations
- [ ] Advanced filtering
- [ ] User analytics dashboard
- [ ] Export to Excel/PDF
- [ ] Email notifications
- [ ] Audit trail
- [ ] Two-factor authentication
- [ ] User activity logs

### التحسينات
- [ ] Virtual scrolling للقوائم الكبيرة
- [ ] Offline support
- [ ] Progressive Web App features
- [ ] Advanced search with Elasticsearch
- [ ] User permissions management
- [ ] Role-based access control

## Troubleshooting

### Common Issues
1. **Form validation errors**: تحقق من البيانات المطلوبة
2. **API connection issues**: تحقق من إعدادات البيئة
3. **Role permission errors**: تحقق من صلاحيات المستخدم

### Debug Tips
- استخدام Browser DevTools
- مراجعة Console logs
- فحص Network requests
- التحقق من API responses

## Support

للحصول على المساعدة أو الإبلاغ عن مشاكل:
- راجع documentation
- تحقق من console logs
- راجع API responses
- تواصل مع فريق التطوير

## هيكل الملفات

```
pledge-dashbord/src/app/modules/user/
├── user-list/
│   ├── user-list.component.ts
│   ├── user-list.component.html
│   └── user-list.component.scss
├── user-detail/
│   ├── user-detail.component.ts
│   ├── user-detail.component.html
│   └── user-detail.component.scss
├── user.module.ts
└── README.md
```

## الميزات المتقدمة

### إدارة العناوين
- إضافة عناوين متعددة
- تحديد العنوان الافتراضي
- تحرير وحذف العناوين
- عرض العناوين في جدول منظم

### إدارة التفضيلات
- اختيار اللغة (الإنجليزية/العربية)
- اختيار المنطقة الزمنية
- تفعيل/إلغاء الإشعارات
- حفظ التفضيلات

### سجل النشاط
- إنشاء الحساب
- آخر تسجيل دخول
- تحديث الملف الشخصي
- Timeline visualization

### إدارة الأدوار
- Admin: صلاحيات كاملة
- Manager: صلاحيات محدودة
- Customer: صلاحيات أساسية
- تغيير الأدوار

## التكامل مع النظام

### Authentication System
- تسجيل الدخول
- تسجيل الخروج
- إدارة الجلسات
- التحقق من الصلاحيات

### Authorization System
- Role-based access control
- Permission management
- Resource protection
- Audit logging

### User Management
- User registration
- Profile management
- Password management
- Account status management 