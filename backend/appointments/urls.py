from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    SpecialtyViewSet, DoctorViewSet, PatientViewSet, AvailabilityViewSet,
    AppointmentViewSet, RatingViewSet, VirtualMeetingLinkViewSet, register
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
    path('', include(router.urls)),
]
