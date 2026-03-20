from rest_framework import permissions
from apps.patients.models import Patient


class IsPatient(permissions.BasePermission):
    """Permite acceso solo a usuarios con perfil de paciente."""
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and Patient.objects.filter(user=request.user).exists()
        )
