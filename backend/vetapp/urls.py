from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

from vetapp import views

# Each API version is wired up explicitly, per resource, rather than captured
# as a URL parameter. A new version for a single resource (e.g.
# 'api/v2/animals/patients/' -> 'animals.urls.patients_v2') can be introduced
# without affecting any other resource's URLs or version.
V1 = {'version': 'v1'}

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/v1/health/', views.HealthView.as_view(), V1, name='api-health'),
    path(
        'api/v1/token/', TokenObtainPairView.as_view(), V1, name='token_obtain_pair'
    ),
    path(
        'api/v1/token/refresh/',
        TokenRefreshView.as_view(),
        V1,
        name='token_refresh',
    ),
    path(
        'api/v1/token/verify/', TokenVerifyView.as_view(), V1, name='token_verify'
    ),
    path('api/v1/user/', include('user.urls.user_v1'), V1),
    path(
        'api/v1/user/specializations/',
        include('user.urls.specializations_v1'),
        V1,
    ),
    path('api/v1/user/', include('user.urls.logout_v1'), V1),
    path('api/v1/user/', include('user.urls.change_password_v1'), V1),
    path('api/v1/clinical-data/', include('clinical_data.urls_v1'), V1),
    path('api/v1/animals/types/', include('animals.urls.types_v1'), V1),
    path('api/v1/animals/patients/', include('animals.urls.patients_v1'), V1),
    path('api/v1/animals/', include('animals.urls.animals_v1'), V1),
    path('api/v1/clients/', include('clients.urls_v1'), V1),
]
