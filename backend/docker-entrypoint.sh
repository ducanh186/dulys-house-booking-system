#!/bin/sh
set -e

echo "==> Running migrations..."
attempts=0
until php artisan migrate --force --no-interaction 2>&1; do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 3 ]; then
        echo "!!! Migration failed after $attempts attempts"
        exit 1
    fi
    echo "--- Migration failed, retrying in 5s ($attempts/3)..."
    sleep 5
done

# Seed only on first run (check if users table is empty)
USER_COUNT=$(php artisan tinker --execute="echo \App\Models\User::count();" 2>/dev/null | tr -d '[:space:]')
if [ "$USER_COUNT" = "0" ] || [ -z "$USER_COUNT" ]; then
    echo "==> Seeding database (first run)..."
    php artisan db:seed --force --no-interaction
else
    echo "==> Database already seeded ($USER_COUNT users), skipping."
fi

# Cache config for performance
php artisan config:cache
php artisan route:cache

echo "==> Starting server on :8000"
exec php artisan serve --host=0.0.0.0 --port=8000
