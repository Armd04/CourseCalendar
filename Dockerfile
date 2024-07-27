# Dockerfile

# Base image
FROM python:3.11-slim

# Install Node.js, npm, and Nginx
RUN apt-get update && apt-get install -y nodejs npm nginx

# Set the working directory for the frontend
WORKDIR /app/frontend

# Copy the Next.js app code
COPY calander-app/package.json ./
COPY calander-app/package-lock.json ./
RUN npm install

COPY calander-app/ .
RUN npm run build

# Set the working directory for the backend
WORKDIR /app/backend

# Copy the Django app code
COPY CourseCalendar/ .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt gunicorn psycopg2-binary

# Environment variables for Django
ENV DJANGO_SETTINGS_MODULE=CourseCalander.settings
ENV PYTHONUNBUFFERED=1

# Copy entrypoint script
WORKDIR /app
COPY entrypoint.sh /entrypoint.sh

# Make the script executable
RUN chmod +x /entrypoint.sh

# Copy Nginx configuration file
COPY nginx.conf /etc/nginx/nginx.conf

# Expose ports for Django and Next.js
EXPOSE 8000
EXPOSE 3000
# Expose port 80 for Nginx
EXPOSE 80

# Run the entrypoint script
CMD ["/entrypoint.sh"]
