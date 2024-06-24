# Stage 1: Build the Next.js application
FROM node:18-alpine AS nextjs-build

WORKDIR /app

# Copy the package.json and package-lock.json files
COPY calander-app/package*.json ./calander-app/

# Install dependencies
RUN npm install --prefix calander-app

# Copy the rest of the Next.js application
COPY calander-app ./calander-app

# Build the Next.js application
RUN npm run build --prefix calander-app

# Stage 2: Build the Django application
FROM python:3.9-slim AS django-build

WORKDIR /app

# Copy the requirements file
COPY requirements.txt /app/

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install psycopg2-binary gunicorn

# Copy the rest of the Django application
COPY . /app/

# Make migrations and migrate the database
RUN python manage.py makemigrations && \
    python manage.py migrate


# Final Stage: Combine both builds
FROM python:3.9-slim

WORKDIR /app

# Install Node.js
RUN apt-get update && \
    apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install psycopg2-binary gunicorn

# Copy Django build
COPY --from=django-build /app /app

# Copy Next.js build
COPY --from=nextjs-build /app/calander-app/.next /app/calander-app/.next
COPY --from=nextjs-build /app/calander-app/public /app/calander-app/public
COPY --from=nextjs-build /app/calander-app/package.json /app/calander-app/package.json

# Set environment variables for Django
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=CourseCalander.settings
ENV NODE_ENV=production

# Expose ports
EXPOSE 8000
EXPOSE 3000

# Command to run both Django and Next.js servers
CMD ["sh", "-c", "gunicorn --bind 0.0.0.0:8000 CourseCalander.wsgi:application & npm run start --prefix calander-app"]
