# نشر الموقع على VPS — Hostalika

دليل خطوة بخطوة لنشر **tel.nashawi.xyz** على استضافة VPS من Hostalika.

## المتطلبات

- VPS يعمل بنظام **Ubuntu 22.04** أو **24.04** (الأكثر شيوعاً على Hostalika)
- وصول **SSH** (root أو مستخدم sudo)
- الدومين `nashawi.xyz` يشير إلى السيرفر

---

## الخطوة 1: إعداد DNS

في لوحة تحكم الدومين (حيث تدير `nashawi.xyz`):

| النوع | الاسم | القيمة | TTL |
|-------|-------|--------|-----|
| **A** | `tel` | `IP-عنوان-الـ-VPS` | 300 |

انتظر 5–30 دقيقة حتى ينتشر DNS. تحقق بـ:

```bash
dig tel.nashawi.xyz +short
```

---

## الخطوة 2: الاتصال بالسيرفر

من Hostalika، انسخ **عنوان IP** و**كلمة مرور SSH**، ثم:

```bash
ssh root@IP-السيرفر
```

أو إذا أنشأت مستخدماً:

```bash
ssh username@IP-السيرفر
```

---

## الخطوة 3: رفع المشروع

### الطريقة أ — عبر Git (موصى بها)

بعد إنشاء المستودع ورفع الكود:

```bash
apt update && apt install -y git
git clone https://github.com/YOUR_USER/nashawi-tel.git /var/www/nashawi-tel
cd /var/www/nashawi-tel
```

### الطريقة ب — عبر SCP من جهازك

```bash
scp -r ./nashawi-tel root@IP-السيرفر:/var/www/
```

---

## الخطوة 4: التثبيت التلقائي

على السيرفر:

```bash
cd /var/www/nashawi-tel
chmod +x deploy/install.sh deploy/update.sh
sudo bash deploy/install.sh
```

السكربت يقوم بـ:
- تثبيت Node.js 20، Nginx، PM2، Certbot
- بناء التطبيق
- إنشاء مجلد بيانات دائم `/var/lib/nashawi-tel`
- إعداد Nginx كـ reverse proxy
- تشغيل التطبيق على المنفذ 3000

---

## الخطوة 5: تفعيل HTTPS (SSL مجاني)

بعد انتشار DNS:

```bash
sudo certbot --nginx -d tel.nashawi.xyz
```

اتبع التعليمات (أدخل بريدك، وافق على الشروط). Certbot يجدد الشهادة تلقائياً.

---

## الخطوة 6: إعداد المدير

1. افتح **https://tel.nashawi.xyz/admin/setup**
2. اضغط «إنشاء كلمة المرور والمفتاح»
3. **انسخ** كلمة المرور ومفتاح الاسترداد واحفظهما
4. ادخل للوحة الإدارة وأضف جهات الاتصال

---

## التحديث بعد تعديل الكود

```bash
cd /var/www/nashawi-tel
bash deploy/update.sh
```

---

## أوامر مفيدة

```bash
# حالة التطبيق
pm2 status
pm2 logs nashawi-tel

# إعادة التشغيل
pm2 restart nashawi-tel

# حالة Nginx
sudo systemctl status nginx
sudo nginx -t

# البيانات المحفوظة
ls -la /var/lib/nashawi-tel/
```

---

## ملفات الإعداد

| الملف | الغرض |
|-------|-------|
| `deploy/ecosystem.config.cjs` | إعداد PM2 |
| `deploy/nginx-tel.nashawi.xyz.conf` | إعداد Nginx |
| `deploy/env.production.example` | متغيرات البيئة |
| `/var/lib/nashawi-tel/` | جهات الاتصال + بيانات المدير |

---

## استكشاف الأخطاء

### الموقع لا يفتح
```bash
pm2 logs nashawi-tel --lines 50
curl -I http://127.0.0.1:3000
```

### خطأ 502 Bad Gateway
- تأكد أن PM2 يعمل: `pm2 status`
- أعد التشغيل: `pm2 restart nashawi-tel`

### SSL لا يعمل
- تأكد أن DNS يشير للـ IP الصحيح
- جرّب: `sudo certbot renew --dry-run`

### نسيت كلمة مرور المدير
افتح **https://tel.nashawi.xyz/admin/recover** وأدخل مفتاح الاسترداد.

---

## جدار الحماية (اختياري)

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'
sudo ufw enable
```

لا تفتح المنفذ 3000 للعامة — Nginx يتولى ذلك داخلياً.
