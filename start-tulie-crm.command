#!/bin/zsh

set -e

CRM_DIR="/Users/tungnguyen/Code/tulie_one_new/apps/tulie_crm"
CRM_URL="http://localhost:3979"

if lsof -nP -iTCP:3979 -sTCP:LISTEN >/dev/null 2>&1; then
  open "$CRM_URL"
  exit 0
fi

cd "$CRM_DIR"
open "$CRM_URL"
exec npm run dev
