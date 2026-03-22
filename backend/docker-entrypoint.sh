#!/bin/sh

echo "Waiting for database..."
php artisan migrate --force --no-interaction 2>&1 || {
    echo "Migration failed — retrying in 5s..."
    sleep 5
    php artisan migrate --force --no-interaction 2>&1 || echo "Migration still failing — continuing anyway"
}

# Seed if tables are empty (first run)
php artisan db:seed --force --no-interaction 2>&1 || true

# Cache config for performance
php artisan config:cache

echo "Starting server..."
exec php artisan serve --host=0.0.0.0 --port=8000
