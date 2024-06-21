# Use the official Python image as the base image
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

COPY . /app
COPY requirements.txt .

# Install python distutils
RUN apt-get update && apt-get install -y npm

# Build frontend
RUN cd calander-app && npm install && npm run build && cd ..

# upgrade pip
RUN pip install --upgrade pip

# Install the requirements
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install psycopg2-binary
RUN pip install gunicorn



RUN python manage.py makemigrations
RUN python manage.py migrate



EXPOSE 3000
EXPOSE 8000

# Set the command to run when the container starts
CMD ["gunicorn CourseCalander.wsgi:application --bind & npm run start --prefix calander-app"]
