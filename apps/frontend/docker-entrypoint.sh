#!/bin/sh
set -eu

if [ -z "${BACKEND_BASE_URL:-}" ]; then
  echo "BACKEND_BASE_URL must be set" >&2
  exit 1
fi

case "$BACKEND_BASE_URL" in
  *\"*|*\\*)
    echo "BACKEND_BASE_URL contains unsupported characters" >&2
    exit 1
    ;;
esac

escaped_url=$(printf '%s' "$BACKEND_BASE_URL" | sed 's/[\\"]/\\&/g')
printf "window.__VOTURA_CONFIG__ = { backendBaseUrl: \"%s\" };\n" "$escaped_url" \
  > /usr/share/nginx/html/config.js

exec "$@"
