#!/bin/sh

# Start Django server with gunicorn in the background
cd /app/backend
gunicorn CourseCalander.wsgi:application --bind 0.0.0.0:8000 &

# Start Next.js server in the background
npm run start --prefix /app/frontend &

# Start Nginx
nginx -g 'daemon off;'
