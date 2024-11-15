from rest_framework import serializers
from .models import Task

class TaskSerializer(serializers.ModelSerializer):
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'difficulty', 'estimated_duration', 'user', 'created_at', 'completed']
        read_only_fields = ['user', 'created_at']