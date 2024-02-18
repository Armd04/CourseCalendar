from django.urls import path
from .views import (LoggedInView,
                    RegisterView,
                    LogoutView,
                    LoginView)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login-api'),
    path('logout/', LogoutView.as_view(), name='logout-api'),
    path('register/', RegisterView.as_view(), name='register-api'),
    path('loggedin/', LoggedInView.as_view(), name='loggedin-api'),
]
