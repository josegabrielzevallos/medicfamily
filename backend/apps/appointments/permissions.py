# Retrocompatibilidad — los permisos viven ahora en sus respectivas apps
from apps.doctors.permissions import IsDoctor, IsAdminOrReadOnly
from apps.patients.permissions import IsPatient

__all__ = ['IsDoctor', 'IsPatient', 'IsAdminOrReadOnly']
