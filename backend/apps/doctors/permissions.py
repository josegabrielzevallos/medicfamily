from rest_framework import permissions
from apps.doctors.models import Doctor


class IsDoctor(permissions.BasePermission):
    """Permite acceso solo a usuarios con perfil de doctor."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and Doctor.objects.filter(user=request.user).exists()
        )


class IsAdminOrReadOnly(permissions.BasePermission):
    """Lectura pública; escritura solo para administradores."""
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_staff
