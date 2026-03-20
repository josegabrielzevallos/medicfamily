from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import SpecialtyViewSet, DoctorViewSet, AvailabilityViewSet, register_doctor

router = DefaultRouter()
router.register(r'specialties', SpecialtyViewSet, basename='specialty')
router.register(r'doctors', DoctorViewSet, basename='doctor')
router.register(r'availabilities', AvailabilityViewSet, basename='availability')

urlpatterns = [
    path('register-doctor/', register_doctor, name='register_doctor'),
    path('', include(router.urls)),
]
