from rest_framework import serializers

class AddCourseSerializer(serializers.Serializer):
    course_id = serializers.CharField(max_length=100)
    class_number = serializers.CharField(max_length=100)
    title = serializers.CharField(max_length=100)
