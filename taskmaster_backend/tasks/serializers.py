from rest_framework import serializers
from .models import Task
from django.contrib.auth.models import User

class TaskSerializer(serializers.ModelSerializer):
    user = serializers.StringRelatedField()
    class Meta:
        model = Task
        fields = ['id', 'title', 'description', 'difficulty', 'estimated_duration', 'user', 'created_at', 'completed']
        read_only_fields = ['user', 'created_at']

class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)    
    class Meta:
        model = User
        fields = ['username', 'email', 'password']