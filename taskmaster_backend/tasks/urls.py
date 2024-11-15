from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ToggleTaskCompletionView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from . import views

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/tasks/<int:pk>/toggle/', ToggleTaskCompletionView.as_view(), name='toggle-task-completion'),
    path('api/signup/', views.sign_up, name='sign_up'),
]
