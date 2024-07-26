from django.shortcuts import render
from django.contrib.auth.models import User
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
import requests
from CourseCalander import settings
from .serializer import AddCourseSerializer
from users.models import Course

class TermDataView(APIView):
    def get(self, request, format=None):
        term = request.query_params.get('term')
        headers = {'x-api-key': settings.API_KEY}
        response = requests.get('https://openapi.data.uwaterloo.ca/v3/ClassSchedules/' + str(term), headers=headers)
        if response.status_code == 200:
            return Response(response.json(), status=status.HTTP_200_OK)
        else:
            return Response(response.text, status=response.status_code)
        

class ClassScheduleView(APIView):
    def get(self, request, format=None):
        course_id = request.query_params.get('id')
        term = request.query_params.get('term')
        headers = {'x-api-key': settings.API_KEY}
        if not course_id is None:
            response = requests.get('https://openapi.data.uwaterloo.ca/v3/ClassSchedules/' + 
                                str(term) + '/' + str(course_id),
                                 headers=headers)
        else:
            subject = request.query_params.get('subject')
            catalog_number = request.query_params.get('catalog_number')
            response = requests.get('https://openapi.data.uwaterloo.ca/v3/ClassSchedules/' + 
                                str(term) + '/' + str(subject) + '/' + str(catalog_number),
                                 headers=headers)
        if response.status_code == 200:
            return Response(response.json(), status=status.HTTP_200_OK)
        else:
            return Response(response.text, status=response.status_code)
        
class AddcourseView(APIView):
    serializer_class = AddCourseSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            course_id = serializer.data.get('course_id')
            class_number = serializer.data.get('class_number')
            title = serializer.data.get('title')
            term = serializer.data.get('term')

            user = User.objects.get(username=request.user.username)
            profile = user.profile
            if profile.courses.filter(class_number=class_number).exists():
                return Response({'message': 'Course already exists'}, status=status.HTTP_400_BAD_REQUEST)
            course = None
            if Course.objects.filter(class_number=class_number).exists():
                course = Course.objects.get(class_number=class_number)
            else:
                course = Course.objects.create(course_id=course_id, class_number=class_number, title=title, term=term)
            
            profile.courses.add(course)
            profile.save()
            return Response({'message': 'Course added'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RemoveCourseView(APIView):
    serializer_class = AddCourseSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            course_id = serializer.data.get('course_id')
            class_number = serializer.data.get('class_number')
            title = serializer.data.get('title')
            term = serializer.data.get('term')
            user = User.objects.get(username=request.user.username)
            profile = user.profile
            if not profile.courses.filter(class_number=class_number).exists():
                return Response({'message': 'Course does not exist'}, status=status.HTTP_400_BAD_REQUEST)
            course = profile.courses.get(class_number=class_number)
            profile.courses.remove(course)
            profile.save()
            return Response({'message': 'Course removed'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetCoursesView(APIView):
    def get(self, request, format=None):
        term = request.query_params.get('term')
        user = User.objects.get(username=request.user.username)
        profile = user.profile
        courses = [course.class_number for course in profile.courses.all() if course.term == term]
        return Response({'courses' : courses}, status=status.HTTP_200_OK)
    

class GetScheduleView(APIView):
    def get(self, request, format=None):
        term = request.query_params.get('term')
        user = User.objects.get(username=request.user.username)
        profile = user.profile
        courses = [(course.course_id, course.class_number, course.title) for course in profile.courses.all() if course.term == term]
        schedule = []
        headers = {'x-api-key': settings.API_KEY}
        for course, class_number, title in courses:
            response = requests.get('https://openapi.data.uwaterloo.ca/v3/ClassSchedules/' + 
                                str(term) + '/' + str(course),
                                 headers=headers)
            for section in response.json():
                if str(section['classNumber']) == class_number:
                    section['title'] = title
                    schedule.append(section)
        
        return Response(schedule, status=status.HTTP_200_OK)
    
class GetSubjectsView(APIView):
    def get(self, request, format=None):
        headers = {'x-api-key': settings.API_KEY}
        response = requests.get('https://openapi.data.uwaterloo.ca/v3/Subjects', headers=headers)
        if response.status_code == 200:
            codes = [subject['code'] for subject in response.json()]
            return Response({'subjects': codes}, status=status.HTTP_200_OK)
        else:
            return Response(response.text, status=response.status_code)
        
class GetTermsView(APIView):
    def get(self, request, format=None):
        headers = {'x-api-key': settings.API_KEY}
        response = requests.get('https://openapi.data.uwaterloo.ca/v3/Terms', headers=headers)
        if response.status_code == 200:
            terms = [term for term in response.json()]
            for i in range(len(terms)):
                for j in range(0, len(terms)-i-1):
                    if terms[j]['termCode'] < terms[j+1]['termCode']:
                        terms[j], terms[j+1] = terms[j+1], terms[j]
            return Response({'terms': terms}, status=status.HTTP_200_OK)
        else:
            return Response(response.text, status=response.status_code)


class GetParticipantsView(APIView):
    def get(self, request, format=None):
        course_id = request.query_params.get('course_id')
        class_number = request.query_params.get('class_number')
        term = request.query_params.get('term')
        headers = {'x-api-key': settings.API_KEY}
        response = requests.get('https://openapi.data.uwaterloo.ca/v3/ClassSchedules/' + 
                                str(term) + '/' + str(course_id),
                                 headers=headers)
        if response.status_code == 200:
            for section in response.json():
                if str(section['classNumber']) == class_number:
                    return Response({'enrolledStudents': section['enrolledStudents'], 'maxEnrollmentCapacity': section['maxEnrollmentCapacity']}, status=status.HTTP_200_OK)
            return Response({'message': 'Section not found'}, status=status.HTTP_404_NOT_FOUND)
        else:
            return Response(response.text, status=response.status_code)

