from rest_framework import serializers

class AddCourseSerializer(serializers.Serializer):
    course_id = serializers.CharField(max_length=100)
