from rest_framework import viewsets
from .models import Task
from .serializers import TaskSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        """Associer la tâche à l'utilisateur authentifié"""
        serializer.save(user=self.request.user)

class ToggleTaskCompletionView(APIView):
    def post(self, request, pk):
        try:
            task = Task.objects.get(pk=pk)
            task.completed = not task.completed  # Toggle the task's completion status
            task.save()
            return Response({"status": "Task completion toggled"}, status=status.HTTP_200_OK)
        except Task.DoesNotExist:
            return Response({"error": "Task not found"}, status=status.HTTP_404_NOT_FOUND)

