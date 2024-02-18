from django.shortcuts import render
from django.contrib.auth.models import User
from django.contrib.auth import authenticate, login, logout
from .serializer import LoginSerializer, ProfileSerializer, RegisterSerializer
from .models import Profile
from rest_framework import viewsets, generics, status
from rest_framework.views import APIView
from rest_framework.response import Response


class LoginView(APIView):
    serializer_class = LoginSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.data.get('username')
            password = serializer.data.get('password')
            user = authenticate(username=username, password=password)
            if user:
                login(request, user)
                return Response({'message': 'Login successful'}, status=status.HTTP_200_OK)
            return Response({'message': 'Invalid credentials'}, status=status.HTTP_401_UNAUTHORIZED)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        

class LogoutView(APIView):
    def get(self, request, format=None):
        logout(request)
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)


class RegisterView(APIView):    
    serializer_class = RegisterSerializer

    def post(self, request, format=None):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            username = serializer.data.get('username')
            password = serializer.data.get('password')
            email = serializer.data.get('email')
            if User.objects.filter(username=username).exists() or User.objects.filter(email=email).exists():
                return Response({'message': 'Username already exists'}, status=status.HTTP_400_BAD_REQUEST)
            user = User.objects.create_user(username=username, password=password, email=email)
            user.save()
            profile = Profile(user=user)
            profile.save()
            return Response({'message': 'User created'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
class LoggedInView(APIView):
    def get(self, request, format=None):
        if request.user.is_authenticated:
            user = User.objects.get(username=request.user.username)
            profile = Profile.objects.get(user=user)
            courses = [course.course_id for course in profile.courses.all()]
            return Response({'username': user.username, 'email' : user.email, 'courses' : courses}, status=status.HTTP_200_OK)
        return Response({'message': 'User is not logged in'}, status=status.HTTP_401_UNAUTHORIZED)


