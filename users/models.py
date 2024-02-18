from django.db import models
from django.contrib.auth.models import User

class Profile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    courses = models.ManyToManyField('Course', blank=True)

    class Course(models.Model):
        course_id = models.CharField(max_length=100)
    
    def __str__(self):
        return self.user.username
    

# Create your models here.
