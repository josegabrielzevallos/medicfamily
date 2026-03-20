from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path('admin/', admin.site.urls),
    # JWT estándar
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    # Auth (register, login, google-login, refresh-token)
    path('api/appointments/', include('apps.accounts.urls')),
    # Doctores, especialidades y disponibilidad
    path('api/appointments/', include('apps.doctors.urls')),
    # Pacientes
    path('api/appointments/', include('apps.patients.urls')),
    # Citas, ratings y virtual-meetings
    path('api/appointments/', include('apps.appointments.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
