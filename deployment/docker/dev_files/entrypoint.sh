#!/bin/sh
set -e

: "${POSTGRES_HOST:=db}"
: "${POSTGRES_PORT:=5432}"
: "${POSTGRES_USER:=vetapp}"

echo "Waiting for postgres at ${POSTGRES_HOST}:${POSTGRES_PORT}..."
until pg_isready -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" -q; do
  sleep 1
done
echo "Postgres is up - continuing"

if [ "$#" -eq 0 ]; then
  python manage.py migrate --noinput
  exec python manage.py runserver 0.0.0.0:8000
else
  exec "$@"
fi
