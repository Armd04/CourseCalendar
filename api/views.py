from django.shortcuts import render
from rest_framework import viewsets, generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
import requests
from CourseCalander import settings

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
        if course_id is None:
            subject = request.query_params.get('subject')
            catalog_number = request.query_params.get('catalog_number')
            response = requests.get('https://openapi.data.uwaterloo.ca/v3/ClassSchedules/' + 
                                str(term) + '/' + str(subject) + '/' + str(catalog_number),
                                 headers=headers)
        if response.status_code == 200:
            return Response(response.json(), status=status.HTTP_200_OK)
        else:
            return Response(response.text, status=response.status_code)
        



