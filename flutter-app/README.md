# برنامج الفرق الفنية - Field Teams App

تطبيق إدارة المهام للفرق الفنية الميدانية مع دعم العمل بدون اتصال.

## المميزات
- **نماذج ديناميكية**: يتم تحميل هياكل النماذج من السيرفر وتعرض تلقائياً
- **أوف‌لاين / أونلاين**: حفظ البيانات محلياً وإرسالها عند توفر الاتصال
- **صلاحيات**: نظام صلاحيات مرن قابل للتوسع
- **دعم كامل للعربية**: واجهة RTL عربية بالكامل

## متطلبات التشغيل
- Flutter SDK >= 3.2.0
- Android SDK (API 21+)
- iOS 12+

## التثبيت

```bash
# 1. استنساخ المشروع
git clone https://github.com/ayamohammad-web/flutter.git
cd flutter

# 2. تثبيت الحزم
flutter pub get

# 3. تشغيل التطبيق
flutter run
```

## هيكل المشروع

```
lib/
├── main.dart              # نقطة الدخول
├── app.dart               # MaterialApp + الـ routing
├── theme/
│   └── app_theme.dart     # الألوان والخطوط
├── models/
│   ├── user.dart          # نموذج المستخدم
│   ├── task.dart          # نموذج المهمة
│   └── form_schema.dart   # نموذج هيكل النماذج الديناميكية
├── providers/
│   ├── auth_provider.dart     # حالة المصادقة
│   ├── tasks_provider.dart    # حالة المهام
│   └── offline_provider.dart  # طابور الأوف‌لاين
├── data/
│   └── mock_data.dart     # بيانات تجريبية (تُستبدل بـ API)
├── screens/
│   ├── login_screen.dart         # شاشة الدخول
│   ├── dashboard_screen.dart     # قائمة المهام
│   ├── task_detail_screen.dart   # تفاصيل المهمة
│   ├── form_screen.dart          # النموذج الديناميكي
│   └── search_screen.dart        # البحث
└── widgets/
    ├── app_header.dart         # الهيدر الأزرق
    ├── task_card.dart          # بطاقة المهمة
    ├── dynamic_form_field.dart # حقل النموذج الديناميكي
    ├── status_badge.dart       # شارة الحالة
    └── sync_banner.dart        # شريط الأوف‌لاين
```

## ربط الـ Backend

ابحث عن `// TODO:` في الكود لمعرفة أماكن ربط الـ API:
- `providers/auth_provider.dart` ← `POST /api/auth/login`
- `providers/tasks_provider.dart` ← `GET /api/tasks`
- `screens/form_screen.dart` ← `POST /api/forms/submit`
- `data/mock_data.dart` ← يُحذف بعد ربط الـ API

## الألوان

| اللون | HEX |
|-------|-----|
| الأزرق الرئيسي | `#1565C0` |
| الذهبي | `#FFC300` |
| الخلفية | `#F0F2F5` |
