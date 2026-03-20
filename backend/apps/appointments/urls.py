from django.urls import path, include
from rest_framework.routers import DefaultRouter

from .views import AppointmentViewSet, RatingViewSet, VirtualMeetingLinkViewSet

router = DefaultRouter()
router.register(r'appointments', AppointmentViewSet, basename='appointment')
router.register(r'ratings', RatingViewSet, basename='rating')
router.register(r'virtual-meetings', VirtualMeetingLinkViewSet, basename='virtual-meeting')

urlpatterns = [
    path('', include(router.urls)),
]
