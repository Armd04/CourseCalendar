from django.shortcuts import render
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
import requests
from CourseCalander import settings
from .serializer import AddCourseSerializer
from django.contrib.auth.mixins import LoginRequiredMixin

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
        
class AddcourseView(LoginRequiredMixin, APIView):
    serializer_class = AddCourseSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            course_id = serializer.data.get('course_id')
            user = request.user
            profile = user.profile
            if profile.courses.filter(course_id=course_id).exists():
                return Response({'message': 'Course already exists'}, status=status.HTTP_400_BAD_REQUEST)
            course = profile.courses.create(course_id=course_id)
            profile.save()
            return Response({'message': 'Course added'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class RemoveCourseView(LoginRequiredMixin, APIView):
    serializer_class = AddCourseSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            course_id = serializer.data.get('course_id')
            user = request.user
            profile = user.profile
            if not profile.courses.filter(course_id=course_id).exists():
                return Response({'message': 'Course does not exist'}, status=status.HTTP_400_BAD_REQUEST)
            course = profile.courses.get(course_id=course_id)
            course.delete()
            profile.save()
            return Response({'message': 'Course removed'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GetCoursesView(LoginRequiredMixin, APIView):
    def get(self, request, format=None):
        user = request.user
        profile = user.profile
        courses = [course.course_id for course in profile.courses.all()]
        return Response({'courses' : courses}, status=status.HTTP_200_OK)
    

class GetScheduleView(LoginRequiredMixin, APIView):
    def get(self, request, format=None):
        user = request.user
        profile = user.profile
        courses = [course.course_id for course in profile.courses.all()]
        schedule = []
        for course in courses:
            response = requests.get('http://localhost:8000/api/class?term=1241&id=' + str(course))
            schedule.append(response.json())
        
        return Response(schedule, status=status.HTTP_200_OK)
        



