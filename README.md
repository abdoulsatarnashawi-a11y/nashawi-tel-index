# دليل الهواتف والعناوين — نشاوي

فهرس شامل للهواتف والعناوين مع لوحة إدارة محمية بكلمة مرور ديناميكية قابلة للنسخ والاسترداد.

**الرابط المقترح:** [tel.nashawi.xyz](https://tel.nashawi.xyz)

## المميزات

- **دليل عام** — بحث بالاسم، الهاتف، العنوان، والتصنيف
- **تصنيفات** — عائلة، أقارب، أصدقاء، عمل، خدمات، طوارئ، وأخرى
- **اتصال مباشر** — أزرار اتصال وواتساب لكل جهة
- **لوحة إدارة** — إضافة، تعديل، وحذف السجلات
- **كلمة مرور ديناميكية** — تُنشأ تلقائياً مع أزرار نسخ
- **استرداد كلمة المرور** — عبر مفتاح استرداد منفصل

## التشغيل المحلي

```bash
npm install
cp .env.example .env.local
npm run dev
```

افتح [http://localhost:43123](http://localhost:43123) (أو المنفذ الذي تختاره).

### أول تشغيل

1. اذهب إلى `/admin/setup`
2. اضغط «إنشاء كلمة المرور والمفتاح»
3. **انسخ** كلمة المرور ومفتاح الاسترداد واحفظهما
4. ادخل للوحة الإدارة من `/admin/login`

## النشر على tel.nashawi.xyz

### خيار 1: VPS — Hostalika / AlmaLinux (موصى به)

سيرفرك: **server.saifcars.eu** · AlmaLinux 10

دليل مفصل: **[deploy/HOSTALIKA.md](deploy/HOSTALIKA.md)**

**ملخص سريع:**

```bash
# على السيرفر (بعد رفع المشروع إلى /var/www/nashawi-tel)
cd /var/www/nashawi-tel
sudo bash deploy/install.sh
sudo certbot --nginx -d tel.nashawi.xyz
```

في DNS أضف سجل **A**: `tel` → `IP-السيرفر`

البيانات تُحفظ دائماً في `/var/lib/nashawi-tel/`.

### خيار 2: Vercel

1. اضغط **Publish** في Cursor أو اربط المستودع بـ Vercel
2. أضف متغير البيئة `JWT_SECRET` بقيمة عشوائية قوية
3. في إعدادات الدومين، أضف `tel.nashawi.xyz` كـ subdomain
4. في DNS عند مزود الدومين، أضف سجل CNAME:
   - **الاسم:** `tel`
   - **القيمة:** `cname.vercel-dns.com` (أو ما يوفره Vercel)

> **ملاحظة:** على Vercel، ملفات البيانات مؤقتة. للتخزين الدائم استخدم VPS (Hostalika) أعلاه.

### خيار 3: تشغيل يدوي

```bash
npm run build
JWT_SECRET=your-secret npm start
```

عيّن `DATA_DIR` لمجلد دائم مثل `/var/lib/nashawi-tel` لحفظ البيانات.

## هيكل المشروع

```
data/
  contacts.json   # جهات الاتصال
  admin.json      # بيانات المدير (يُنشأ تلقائياً — لا ترفعه)
src/
  app/            # الصفحات وواجهات API
  components/     # مكوّنات الواجهة
  lib/            # التخزين، المصادقة، والأدوات
```

## استرداد كلمة المرور

إذا نسيت كلمة المرور:

1. اذهب إلى `/admin/recover`
2. أدخل **مفتاح الاسترداد** الذي حفظته عند الإعداد
3. سيتم إنشاء كلمة مرور ومفتاح استرداد جديدين — انسخهما فوراً

## التقنيات

- Next.js 16 + TypeScript
- Tailwind CSS + shadcn/ui
- تخزين JSON محلي
- JWT للجلسات
