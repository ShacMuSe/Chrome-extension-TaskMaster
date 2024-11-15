from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView, View
from django.contrib.auth.models import User
from django.contrib.auth.hashers import make_password
from rest_framework import status
from rest_framework.decorators import api_view
from rest_framework.response import Response
from .serializers import UserSerializer
from rest_framework.exceptions import PermissionDenied


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    #def get_queryset(self):
        # Only return tasks that belong to the logged-in user
    #    return Task.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        #Set the user to the current logged-in user
        serializer.save(user=self.request.user)

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        if task.user != request.user:
            return Response({"detail": "You are not the owner of this task."}, status=status.HTTP_403_FORBIDDEN)

        # If the user is the owner, proceed with the update
        return super().update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        if task.user != request.user:
            return Response({"detail": "You are not the owner of this task."}, status=status.HTTP_403_FORBIDDEN)

        # If the user is the owner, proceed with deletion
        return super().destroy(request, *args, **kwargs)

class ToggleTaskCompletionView(APIView):
    permission_classes = [IsAuthenticated]  # Ensure the user is authenticated

    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)

            # Check if the task belongs to the currently authenticated user
            if task.user != request.user:
                raise PermissionDenied("This is not the owner of the task")  # Raise a permission error if not the owner
            
            # Toggle the task's completion status
            task.completed = not task.completed
            task.save()
            
            return Response({"status": "Task completion toggled"}, status=status.HTTP_200_OK)

        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)
        except PermissionDenied as e:
            return Response({"error": str(e)}, status=status.HTTP_403_FORBIDDEN)

@api_view(['POST'])
def sign_up(request):
    if request.method == 'POST':
        # Deserialize the data
        serializer = UserSerializer(data=request.data)
        
        if serializer.is_valid():
            # Save the new user
            user = serializer.save(password=make_password(request.data['password']))
            return Response({"message": "User created successfully"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)