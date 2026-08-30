#!/usr/bin/env bash
# إنشاء أرشيف للرفع عبر SCP إلى السيرفر
# الاستخدام: bash deploy/pack.sh
set -euo pipefail

OUT="/tmp/nashawi-tel.tar.gz"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"

cd "$ROOT"
tar -czf "$OUT" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  --exclude=data/admin.json \
  --transform 's,^,nashawi-tel/,' \
  .

echo "✅ تم إنشاء: $OUT"
echo ""
echo "ارفع إلى السيرفر (Terminal على جهازك):"
echo "  scp $OUT root@server.saifcars.eu:/tmp/"
echo ""
echo "على السيرفر (Terminal):"
echo "  tar -xzf /tmp/nashawi-tel.tar.gz -C /var/www"
echo "  cd /var/www/nashawi-tel && bash deploy/install.sh"
