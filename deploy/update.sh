#!/usr/bin/env bash
# تحديث التطبيق بعد تعديل الكود
# الاستخدام: bash deploy/update.sh
set -euo pipefail

APP_DIR="/var/www/nashawi-tel"

cd "$APP_DIR"

echo "==> جلب آخر التحديثات..."
git pull

echo "==> تثبيت الحزم..."
npm ci

echo "==> بناء التطبيق..."
npm run build

echo "==> إعادة تشغيل PM2..."
pm2 restart nashawi-tel

echo "✅ تم التحديث بنجاح — https://tel.nashawi.xyz"
