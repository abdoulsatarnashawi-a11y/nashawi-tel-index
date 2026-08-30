#!/usr/bin/env bash
# تثبيت دليل الهواتف على VPS (Ubuntu / Debian / AlmaLinux / RHEL)
# الاستخدام: sudo bash deploy/install.sh
set -euo pipefail

APP_DIR="/var/www/nashawi-tel"
DATA_DIR="/var/lib/nashawi-tel"
DOMAIN="tel.nashawi.xyz"
REPO_URL="${REPO_URL:-}"
NGINX_CONF_DEBIAN="/etc/nginx/sites-available/$DOMAIN"
NGINX_CONF_RHEL="/etc/nginx/conf.d/$DOMAIN.conf"

detect_os() {
  if [[ -f /etc/os-release ]]; then
    # shellcheck source=/dev/null
    . /etc/os-release
    case "${ID:-}" in
      ubuntu | debian) echo "debian" ;;
      almalinux | rocky | rhel | centos | fedora) echo "rhel" ;;
      *) echo "unknown" ;;
    esac
  else
    echo "unknown"
  fi
}

install_node_debian() {
  curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
  apt-get install -y -qq nodejs
}

install_node_rhel() {
  curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
  dnf install -y nodejs
}

install_deps_debian() {
  export DEBIAN_FRONTEND=noninteractive
  apt-get update -qq
  apt-get install -y -qq curl git nginx certbot python3-certbot-nginx openssl
  if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
    echo "==> تثبيت Node.js 20..."
    install_node_debian
  fi
}

install_deps_rhel() {
  dnf install -y curl git nginx certbot python3-certbot-nginx openssl policycoreutils-python-utils
  dnf install -y epel-release 2>/dev/null || true
  if ! command -v node &>/dev/null || [[ "$(node -v | cut -d. -f1 | tr -d v)" -lt 20 ]]; then
    echo "==> تثبيت Node.js 20..."
    install_node_rhel
  fi
  systemctl enable --now nginx
  # SELinux: السماح لـ Nginx بالاتصال بالتطبيق
  if command -v getenforce &>/dev/null && [[ "$(getenforce)" != "Disabled" ]]; then
    setsebool -P httpd_can_network_connect 1 2>/dev/null || true
  fi
}

setup_nginx_debian() {
  cp deploy/nginx-tel.nashawi.xyz.conf "$NGINX_CONF_DEBIAN"
  ln -sf "$NGINX_CONF_DEBIAN" "/etc/nginx/sites-enabled/$DOMAIN"
  rm -f /etc/nginx/sites-enabled/default 2>/dev/null || true
}

setup_nginx_rhel() {
  cp deploy/nginx-tel.nashawi.xyz.conf "$NGINX_CONF_RHEL"
}

setup_firewall() {
  if command -v firewall-cmd &>/dev/null && systemctl is-active firewalld &>/dev/null; then
    echo "==> فتح HTTP/HTTPS في firewalld..."
    firewall-cmd --permanent --add-service=http
    firewall-cmd --permanent --add-service=https
    firewall-cmd --reload
  elif command -v ufw &>/dev/null; then
    ufw allow OpenSSH 2>/dev/null || true
    ufw allow 'Nginx Full' 2>/dev/null || true
  fi
}

OS="$(detect_os)"
echo "==> النظام المكتشف: $OS"

echo "==> تثبيت المتطلبات..."
case "$OS" in
  debian) install_deps_debian ;;
  rhel) install_deps_rhel ;;
  *)
    echo "❌ نظام غير مدعوم. استخدم Ubuntu أو AlmaLinux."
    exit 1
    ;;
esac

if ! command -v pm2 &>/dev/null; then
  echo "==> تثبيت PM2..."
  npm install -g pm2
fi

echo "==> إعداد مجلدات التطبيق والبيانات..."
mkdir -p "$APP_DIR" "$DATA_DIR"

if [[ -n "$REPO_URL" ]]; then
  echo "==> استنساخ المستودع..."
  if [[ ! -d "$APP_DIR/.git" ]]; then
    git clone "$REPO_URL" "$APP_DIR"
  else
    git -C "$APP_DIR" pull
  fi
fi

if [[ ! -f "$APP_DIR/package.json" ]]; then
  echo ""
  echo "❌ ملفات المشروع غير موجودة في $APP_DIR"
  echo ""
  echo "ارفع المشروع أولاً، مثلاً:"
  echo "  scp -r . root@server.saifcars.eu:/var/www/nashawi-tel"
  echo ""
  echo "أو مع Git:"
  echo "  REPO_URL=https://your-repo.git sudo bash deploy/install.sh"
  exit 1
fi

cd "$APP_DIR"

if [[ ! -f .env.production ]]; then
  cp deploy/env.production.example .env.production
  JWT_SECRET=$(openssl rand -base64 48 | tr -d '/+=' | head -c 48)
  sed -i "s|JWT_SECRET=.*|JWT_SECRET=$JWT_SECRET|" .env.production
  echo "⚠️  تم إنشاء JWT_SECRET في .env.production"
fi

echo "==> تثبيت الحزم وبناء التطبيق..."
npm ci
npm run build

echo "==> نسخ بيانات أولية..."
if [[ ! -f "$DATA_DIR/contacts.json" && -f "$APP_DIR/data/contacts.json" ]]; then
  cp "$APP_DIR/data/contacts.json" "$DATA_DIR/contacts.json"
fi
chmod 755 "$DATA_DIR"
chmod 644 "$DATA_DIR/"*.json 2>/dev/null || true

echo "==> إعداد Nginx..."
case "$OS" in
  debian) setup_nginx_debian ;;
  rhel) setup_nginx_rhel ;;
esac
nginx -t
systemctl enable nginx
systemctl reload nginx

setup_firewall

echo "==> تشغيل التطبيق بـ PM2..."
export $(grep -v '^#' .env.production | xargs)
pm2 delete nashawi-tel 2>/dev/null || true
pm2 start deploy/ecosystem.config.cjs
pm2 save
env PATH="$PATH:/usr/bin" pm2 startup systemd -u root --hp /root 2>/dev/null || pm2 startup

SERVER_IP="$(curl -4 -s --max-time 5 ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')"

echo ""
echo "============================================"
echo "✅ التثبيت اكتمل على $(hostname)!"
echo ""
echo "الخطوات التالية:"
echo "  1. DNS — سجل A في nashawi.xyz:"
echo "     الاسم: tel"
echo "     القيمة: $SERVER_IP"
echo ""
echo "  2. SSL (بعد انتشار DNS):"
echo "     certbot --nginx -d $DOMAIN"
echo ""
echo "  3. الإعداد:"
echo "     https://$DOMAIN/admin/setup"
echo "============================================"
