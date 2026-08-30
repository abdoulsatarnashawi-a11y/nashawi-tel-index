# نشر على Hostalika — AlmaLinux 10

دليل مخصص لسيرفرك:

| البند | القيمة |
|-------|--------|
| **Hostname** | `server.saifcars.eu` |
| **النظام** | AlmaLinux 10.0 |
| **الموارد** | 2 vCPU · 4 GB RAM · 80 GB |
| **الدومين** | `tel.nashawi.xyz` |

---

## الخطوة 1: الاتصال بالسيرفر

```bash
ssh root@server.saifcars.eu
```

أدخل كلمة المرور من لوحة Hostalika.

> إذا لم يعمل بالاسم، استخدم **عنوان IP** من لوحة Hostalika:
> `ssh root@IP-السيرفر`

---

## الخطوة 2: DNS

في لوحة تحكم دومين `nashawi.xyz`:

| النوع | الاسم | القيمة |
|-------|-------|--------|
| **A** | `tel` | IP السيرفر (من Hostalika) |

لمعرفة IP السيرفر بعد الاتصال:

```bash
curl -4 ifconfig.me
```

---

## الخطوة 3: رفع المشروع

### من جهازك (بعد إنشاء المستودع)

```bash
# في مجلد المشروع على جهازك
bash deploy/pack.sh
scp /tmp/nashawi-tel.tar.gz root@server.saifcars.eu:/tmp/
```

### على السيرفر

```bash
dnf install -y tar git
mkdir -p /var/www
tar -xzf /tmp/nashawi-tel.tar.gz -C /var/www
mv /var/www/nashawi-tel* /var/www/nashawi-tel 2>/dev/null || true
cd /var/www/nashawi-tel
chmod +x deploy/*.sh
bash deploy/install.sh
```

> السكربت يدعم AlmaLinux تلقائياً (dnf, firewalld, SELinux, nginx/conf.d).

### أو عبر Git

```bash
dnf install -y git
git clone YOUR_REPO_URL /var/www/nashawi-tel
cd /var/www/nashawi-tel
bash deploy/install.sh
```

---

## الخطوة 4: SSL

بعد انتشار DNS (تحقق: `dig tel.nashawi.xyz +short`):

```bash
certbot --nginx -d tel.nashawi.xyz
```

---

## الخطوة 5: إعداد المدير

1. افتح **https://tel.nashawi.xyz/admin/setup**
2. أنشئ كلمة المرور ومفتاح الاسترداد
3. **انسخهما واحفظهما**

---

## أوامر AlmaLinux المفيدة

```bash
# حالة الخدمات
systemctl status nginx
pm2 status
pm2 logs nashawi-tel

# جدار الحماية
firewall-cmd --list-all

# SELinux (إذا ظهر 502)
getenforce
setsebool -P httpd_can_network_connect 1

# تحديث التطبيق
cd /var/www/nashawi-tel && bash deploy/update.sh
```

---

## استكشاف الأخطاء

| المشكلة | الحل |
|---------|------|
| `Connection refused` SSH | تحقق من IP وكلمة المرور في Hostalika |
| 502 Bad Gateway | `pm2 restart nashawi-tel` ثم `nginx -t` |
| Certbot يفشل | تأكد DNS يشير لـ IP السيرفر |
| Permission denied على البيانات | `chown -R root:root /var/lib/nashawi-tel` |

---

## ملاحظة عن server.saifcars.eu

`server.saifcars.eu` هو **اسم السيرفر** للوصول عبر SSH.
الموقع العام سيكون على **`tel.nashawi.xyz`** بعد إعداد DNS وSSL.
