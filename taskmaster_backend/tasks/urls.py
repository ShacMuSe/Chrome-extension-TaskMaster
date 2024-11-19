from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet, ToggleTaskCompletionView, UserProfileView, SignUpView, RankingView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

router = DefaultRouter()
router.register(r'tasks', TaskViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/tasks/<int:pk>/toggle/', ToggleTaskCompletionView.as_view(), name='toggle-task-completion'),
    path('api/signup/', SignUpView.as_view(), name='sign_up'),
    path('api/user-profile/', UserProfileView.as_view(), name='user-profile'),
    path('api/rankings/', RankingView.as_view(), name='rankings'),
]
