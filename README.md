# CourseCalander

Web App with schedule visualization for courses at the University of Waterloo. This App allows students to easily visualize their schedule and plan their courses for each semester before enrolling in Quest.

## Backend
The backend is a RESTful API built with Django Rest Framework, and the database is managed with PostgreSQL. The API and database are both hosted on Railway.

## Frontend
The frontend is built using NextJS and Bootstrap. The frontend is also hosted on Railway.

## How to run the project locally
1. Clone the repository
2. Install the dependencies
    - `pip install -r backend/requirements.txt`
    - `npm install --prefix frontend`
3. Create a `.env` file in the root directory as the example provided in `.env.example`
4. If you have docker installed, you can run the project with running the following command in the root directory
    - `docker build -t coursecalander .`
    - `docker run -d -p 80:80 coursecalander`
4. Or alternatively, you can run the backend server
    - `python manage.py runserver`
5. And run the frontend server
    - `npm run dev`
