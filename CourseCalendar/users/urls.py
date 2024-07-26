from django.urls import path
from .views import (LoggedInView,
                    RegisterView,
                    LogoutView,
                    LoginView)
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,)

urlpatterns = [
    path('login/', LoginView.as_view(), name='login-api'),
    path('logout/', LogoutView.as_view(), name='logout-api'),
    path('register/', RegisterView.as_view(), name='register-api'),
    path('logged-in/', LoggedInView.as_view(), name='loggedin-api'),
    path('token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
]
