#!/usr/bin/env bash
# تثبيت دليل الهواتف على VPS (Hostalika / Ubuntu)
# الاستخدام: sudo bash deploy/install.sh
set -euo pipefail

APP_DIR="/var/www/nashawi-tel"
DATA_DIR="/var/lib/nashawi-tel"
DOMAIN="tel.nashawi.xyz"
REPO_URL="${REPO_URL:-}"

echo "==> تثبيت المتطلبات..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq curl git nginx certbot python3-certbot-nginx

if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
  echo "==> تثبيت Node.js 20..."
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
fi

if ! command -v pm2 &>/dev/null; then
  echo "==> تثبيت PM2..."
  npm install -g pm2
fi

echo "==> إعداد مجلدات التطبيق والبيانات..."
mkdir -p "$APP_DIR" "$DATA_DIR"
chown -R "${SUDO_USER:-root}:${SUDO_USER:-root}" "$DATA_DIR" 2>/dev/null || true

if [[ -n "$REPO_URL" ]]; then
  echo "==> استنساخ المستودع..."
  if [[ ! -d "$APP_DIR/.git" ]]; then
    git clone "$REPO_URL" "$APP_DIR"
  else
    cd "$APP_DIR" && git pull
  fi
else
  echo "==> انسخ ملفات المشروع يدوياً إلى $APP_DIR"
  echo "    أو عيّن REPO_URL قبل التشغيل:"
  echo "    REPO_URL=https://github.com/user/repo.git sudo bash deploy/install.sh"
fi

cd "$APP_DIR"

if [[ ! -f .env.production ]]; then
  cp deploy/env.production.example .env.production
  JWT_SECRET=$(openssl rand -base64 48 | tr -d '/+=' | head -c 48)
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.production
  echo ""
  echo "⚠️  تم إنشاء JWT_SECRET تلقائياً في .env.production"
fi

echo "==> تثبيت الحزم وبناء التطبيق..."
npm ci
npm run build

echo "==> نسخ بيانات أولية إن لم تكن موجودة..."
if [[ ! -f "$DATA_DIR/contacts.json" && -f "$APP_DIR/data/contacts.json" ]]; then
  cp "$APP_DIR/data/contacts.json" "$DATA_DIR/contacts.json"
fi

echo "==> إعداد Nginx..."
cp deploy/nginx-tel.nashawi.xyz.conf "/etc/nginx/sites-available/$DOMAIN"
ln -sf "/etc/nginx/sites-available/$DOMAIN" "/etc/nginx/sites-enabled/$DOMAIN"
nginx -t
systemctl reload nginx

echo "==> تشغيل التطبيق بـ PM2..."
pm2 delete nashawi-tel 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup systemd -u "${SUDO_USER:-root}" --hp "/home/${SUDO_USER:-root}" 2>/dev/null || pm2 startup

echo ""
echo "============================================"
echo "✅ التثبيت اكتمل!"
echo ""
echo "الخطوات التالية:"
echo "  1. في DNS، أضف سجل A:"
echo "     الاسم: tel"
echo "     القيمة: $(curl -4 -s ifconfig.me 2>/dev/null || echo 'IP-السيرفر')"
echo ""
echo "  2. فعّل SSL:"
echo "     sudo certbot --nginx -d $DOMAIN"
echo ""
echo "  3. افتح https://$DOMAIN/admin/setup"
echo "     وأنشئ كلمة المرور ومفتاح الاسترداد"
echo "============================================"
