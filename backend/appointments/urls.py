from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpecialtyViewSet, DoctorViewSet, PatientViewSet, AvailabilityViewSet,
    AppointmentViewSet, RatingViewSet, VirtualMeetingLinkViewSet, register, register_doctor,
    custom_login, custom_refresh_token
)

# Crear el router
router = DefaultRouter()
router.register(r'specialties', SpecialtyViewSet, basename='specialty')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'patients', PatientViewSet, basename='patient')
router.register(r'availabilities', AvailabilityViewSet, basename='availability')
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'virtual-meetings', VirtualMeetingLinkViewSet, basename='virtual-meeting')

urlpatterns = [
    path('register/', register, name='register'),
    path('register-doctor/', register_doctor, name='register_doctor'),
    path('login/', custom_login, name='custom_login'),
    path('refresh-token/', custom_refresh_token, name='refresh_token'),
    path('', include(router.urls)),
]
