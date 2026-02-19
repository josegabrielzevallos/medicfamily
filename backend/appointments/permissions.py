from rest_framework import permissions
from .models import Doctor, Patient


class IsDoctor(permissions.BasePermission):
    """Permiso para verificar si el usuario es doctor"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and Doctor.objects.filter(user=request.user).exists()


class IsPatient(permissions.BasePermission):
    """Permiso para verificar si el usuario es paciente"""
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and Patient.objects.filter(user=request.user).exists()


class IsAdminOrReadOnly(permissions.BasePermission):
    """Permiso para que solo admin pueda editar y cualquiera pueda leer"""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
