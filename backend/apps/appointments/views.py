from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone

from apps.appointments.models import Appointment, VirtualMeetingLink, Rating
from apps.appointments.serializers import (
    AppointmentSerializer, AppointmentDetailSerializer,
    VirtualMeetingLinkSerializer, RatingSerializer,
)
from apps.doctors.models import Doctor
from apps.patients.models import Patient


class AppointmentViewSet(viewsets.ModelViewSet):
    """CRUD de citas médicas."""
    queryset = Appointment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['appointment_date', 'status']

    def get_serializer_class(self):
        if self.action == 'retrieve':
            return AppointmentDetailSerializer
        return AppointmentSerializer

    def get_queryset(self):
        user = self.request.user
        try:
            doctor = Doctor.objects.get(user=user)
            return Appointment.objects.filter(doctor=doctor)
        except Doctor.DoesNotExist:
            pass
        try:
            patient = Patient.objects.get(user=user)
            return Appointment.objects.filter(patient=patient)
        except Patient.DoesNotExist:
            pass
        if user.is_staff:
            return Appointment.objects.all()
        return Appointment.objects.none()

    def perform_create(self, serializer):
        user = self.request.user
        try:
            doctor = Doctor.objects.get(user=user)
            patient_id = self.request.data.get('patient_id')
            if not patient_id:
                from rest_framework.exceptions import ValidationError
                raise ValidationError({'patient_id': 'El doctor debe indicar patient_id para crear la cita.'})
            patient = get_object_or_404(Patient, id=patient_id)
            serializer.save(patient=patient, doctor=doctor)
            return
        except Doctor.DoesNotExist:
            pass
        try:
            patient = Patient.objects.get(user=user)
            serializer.save(patient=patient)
        except Patient.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Solo pacientes o doctores pueden agendar citas.'})

    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Doctor confirma una cita."""
        appointment = self.get_object()
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Solo doctores pueden confirmar citas.'}, status=status.HTTP_403_FORBIDDEN)
        if appointment.doctor != doctor:
            return Response({'detail': 'No tienes permiso para confirmar esta cita.'}, status=status.HTTP_403_FORBIDDEN)
        appointment.status = 'confirmed'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Doctor marca una cita como completada."""
        appointment = self.get_object()
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Solo doctores pueden completar citas.'}, status=status.HTTP_403_FORBIDDEN)
        if appointment.doctor != doctor:
            return Response({'detail': 'No tienes permiso para completar esta cita.'}, status=status.HTTP_403_FORBIDDEN)
        appointment.status = 'completed'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Paciente o doctor cancela una cita."""
        appointment = self.get_object()
        try:
            user_doctor = Doctor.objects.get(user=request.user)
            if appointment.doctor != user_doctor:
                return Response({'detail': 'No tienes permiso para cancelar esta cita.'}, status=status.HTTP_403_FORBIDDEN)
        except Doctor.DoesNotExist:
            try:
                user_patient = Patient.objects.get(user=request.user)
                if appointment.patient != user_patient:
                    return Response({'detail': 'No tienes permiso para cancelar esta cita.'}, status=status.HTTP_403_FORBIDDEN)
            except Patient.DoesNotExist:
                return Response({'detail': 'No tienes permiso.'}, status=status.HTTP_403_FORBIDDEN)
        appointment.status = 'cancelled'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)

    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Citas próximas pendientes o confirmadas."""
        now = timezone.now()
        qs = self.get_queryset().filter(
            appointment_date__gte=now,
            status__in=['pending', 'confirmed'],
        ).order_by('appointment_date')
        return Response(self.get_serializer(qs, many=True).data)

    @action(detail=False, methods=['get'])
    def past(self, request):
        """Citas pasadas completadas."""
        qs = self.get_queryset().filter(status='completed').order_by('-appointment_date')
        return Response(self.get_serializer(qs, many=True).data)


class RatingViewSet(viewsets.ModelViewSet):
    """CRUD de calificaciones."""
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        appointment_id = self.request.data.get('appointment')
        appointment = get_object_or_404(Appointment, id=appointment_id)
        try:
            patient = Patient.objects.get(user=self.request.user)
        except Patient.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo pacientes pueden calificar citas.')
        if appointment.patient != patient:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo el paciente de la cita puede calificarla.')
        serializer.save(patient=patient, doctor=appointment.doctor)


class VirtualMeetingLinkViewSet(viewsets.ModelViewSet):
    """CRUD de enlaces de reuniones virtuales."""
    queryset = VirtualMeetingLink.objects.all()
    serializer_class = VirtualMeetingLinkSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        try:
            doctor = Doctor.objects.get(user=self.request.user)
        except Doctor.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo doctores pueden crear enlaces de reunión.')
        appointment_id = self.request.data.get('appointment')
        appointment = get_object_or_404(Appointment, id=appointment_id)
        if appointment.doctor != doctor:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('No tienes permiso para agregar enlace a esta cita.')
        serializer.save()
