#!/usr/bin/env bash
# إنشاء أرشيف للرفع عبر SCP إلى السيرفر
# الاستخدام: bash deploy/pack.sh
set -euo pipefail

OUT="/tmp/nashawi-tel.tar.gz"

tar -czf "$OUT" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=data/admin.json \
  -C "$(dirname "$(pwd)")" "$(basename "$(pwd)")"

echo "✅ تم إنشاء: $OUT"
echo ""
echo "ارفع إلى السيرفر:"
echo "  scp $OUT root@server.saifcars.eu:/tmp/"
echo ""
echo "على السيرفر:"
echo "  mkdir -p /var/www/nashawi-tel"
echo "  tar -xzf /tmp/nashawi-tel.tar.gz -C /var/www --strip-components=0"
echo "  cd /var/www/nashawi-tel && sudo bash deploy/install.sh"
