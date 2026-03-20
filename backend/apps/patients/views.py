from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db.models import Q

from apps.patients.models import Patient
from apps.patients.serializers import PatientSerializer
from apps.doctors.models import Doctor


class PatientViewSet(viewsets.ModelViewSet):
    """CRUD de pacientes."""
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]

    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """Obtiene todas las citas de un paciente."""
        from apps.appointments.serializers import AppointmentSerializer
        patient = self.get_object()
        serializer = AppointmentSerializer(patient.appointments.all(), many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get', 'patch'])
    def my_profile(self, request):
        """Obtiene o actualiza el perfil del paciente autenticado."""
        try:
            patient = Patient.objects.get(user=request.user)
        except Patient.DoesNotExist:
            return Response({'detail': 'Paciente no encontrado'}, status=404)

        if request.method == 'GET':
            return Response(self.get_serializer(patient).data)

        # PATCH — actualiza campos de user y patient
        user = request.user
        user_fields = ['first_name', 'last_name', 'username']
        for field in user_fields:
            if field in request.data:
                setattr(user, field, request.data[field])
        changed = [f for f in user_fields if f in request.data]
        if changed:
            user.save(update_fields=changed)

        patient_fields = ['phone', 'date_of_birth', 'blood_type', 'allergies', 'medical_conditions', 'emergency_contact']
        for field in patient_fields:
            if field in request.data:
                value = request.data[field]
                if field in ('date_of_birth', 'blood_type') and not value:
                    value = None
                setattr(patient, field, value)
        patient.save()

        return Response(self.get_serializer(patient).data)

    @action(detail=False, methods=['get'])
    def for_doctor(self, request):
        """Lista de pacientes con citas del doctor autenticado. Soporta ?q=nombre."""
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Solo doctores pueden ver esta lista.'}, status=403)

        from apps.appointments.models import Appointment
        patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient_id', flat=True).distinct()
        queryset = Patient.objects.filter(id__in=patient_ids)

        q = request.query_params.get('q', '').strip()
        if q:
            queryset = queryset.filter(
                Q(user__first_name__icontains=q) |
                Q(user__last_name__icontains=q) |
                Q(user__email__icontains=q)
            )

        return Response(self.get_serializer(queryset, many=True).data)
