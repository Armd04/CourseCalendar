# Use the official Python image as the base image
FROM python:3.11

# Set the working directory in the container
WORKDIR /app

COPY . /app
COPY requirements.txt .

# Install python distutils
RUN apt-get update && apt-get install -y npm postgresql postgresql-contrib

# Build frontend
RUN cd calander-app && npm install && npm run build && cd ..

# upgrade pip
RUN pip install --upgrade pip

# Install the requirements
RUN pip install --no-cache-dir -r requirements.txt
RUN pip install psycopg2-binary


# Create Database
RUN service postgresql start
RUN psql -U postgres -c "CREATE DATABASE db;"

RUN python manage.py makemigrations
RUN python manage.py migrate






# Set port
ENV PORT_BACK 8000
ENV PORT_FRONT 3000

EXPOSE $PORT_BACK
EXPOSE $PORT_FRONT

# Set the command to run when the container starts
CMD ["sh", "-c", "gunicorn CourseCalander.wsgi:application --bind & npm run start --prefix calander-app"]