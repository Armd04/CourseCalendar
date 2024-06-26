# Use the official Python image from the Docker Hub
FROM python:3.9-slim

# Set the working directory in the container
WORKDIR /app

# Install dependencies
RUN apt-get update && \
    apt-get install -y npm nginx supervisor && \
    rm -rf /var/lib/apt/lists/*

RUN pip install --upgrade pip

# Copy the requirements file into the container
COPY calander-app/package*.json /app/calander-app/
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install psycopg2-binary gunicorn

# Install npm dependencies
RUN npm install --prefix calander-app

# Copy the rest of the application's code into the container
COPY . /app/

# Build the Next.js application
RUN npm run build --prefix calander-app

# Copy Nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Copy Supervisor configuration
COPY supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Set environment variables for Django
ENV PYTHONUNBUFFERED=1
ENV DJANGO_SETTINGS_MODULE=CourseCalander.settings
ENV NODE_ENV production

# Expose the port the app runs on
EXPOSE 8000
EXPOSE 3000

# Run the application using supervisor
CMD ["supervisord", "-c", "/etc/supervisor/supervisord.conf"]
