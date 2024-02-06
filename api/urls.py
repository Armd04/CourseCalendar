from django.urls import path
from .views import (TermDataView,
                    ClassScheduleView)

urlpatterns = [
    path('term/', TermDataView.as_view(), name='term-api'),
    path('class/', ClassScheduleView.as_view(), name='class-api'),
]
