from rest_framework import viewsets, status, permissions, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from django.shortcuts import get_object_or_404
from django.db.models import Q
from django.utils import timezone
from django.contrib.auth.models import User

from .models import (
    Specialty, Doctor, Patient, Availability, Appointment,
    VirtualMeetingLink, Rating
)
from .serializers import (
    SpecialtySerializer, DoctorSerializer, PatientSerializer,
    AvailabilitySerializer, AppointmentSerializer, AppointmentDetailSerializer,
    VirtualMeetingLinkSerializer, RatingSerializer
)
from .permissions import IsDoctor, IsPatient, IsAdminOrReadOnly


@api_view(['POST'])
def register(request):
    """Endpoint para registrar nuevos usuarios (paciente o doctor)"""
    try:
        username = request.data.get('username')
        email = request.data.get('email')
        password = request.data.get('password')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        user_type = request.data.get('user_type', 'patient')  # 'patient' o 'doctor'
        
        # Validar que no exista el usuario
        if User.objects.filter(username=username).exists():
            return Response(
                {'detail': 'El usuario ya existe'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        if User.objects.filter(email=email).exists():
            return Response(
                {'detail': 'El email ya está registrado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Crear usuario
        user = User.objects.create_user(
            username=username,
            email=email,
            password=password,
            first_name=first_name,
            last_name=last_name
        )
        
        # Crear perfil según el tipo
        if user_type == 'doctor':
            Doctor.objects.create(user=user)
        else:
            Patient.objects.create(user=user)
        
        # Generar tokens JWT
        refresh = RefreshToken.for_user(user)
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
            }
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    """ViewSet para especialidades - Solo lectura"""
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class DoctorViewSet(viewsets.ModelViewSet):
    """ViewSet para doctores"""
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialty__name']
    ordering_fields = ['consultation_fee', 'created_at']
    
    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """Obtiene todas las citas de un doctor"""
        doctor = self.get_object()
        appointments = doctor.appointments.all()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Obtiene disponibilidad de un doctor"""
        doctor = self.get_object()
        availability = doctor.availabilities.all()
        serializer = AvailabilitySerializer(availability, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def ratings(self, request, pk=None):
        """Obtiene calificaciones de un doctor"""
        doctor = self.get_object()
        ratings = doctor.ratings.all()
        serializer = RatingSerializer(ratings, many=True)
        return Response(serializer.data)


class PatientViewSet(viewsets.ModelViewSet):
    """ViewSet para pacientes"""
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """Obtiene todas las citas de un paciente"""
        patient = self.get_object()
        appointments = patient.appointments.all()
        serializer = AppointmentSerializer(appointments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def my_profile(self, request):
        """Obtiene el perfil del paciente autenticado"""
        try:
            patient = Patient.objects.get(user=request.user)
            serializer = self.get_serializer(patient)
            return Response(serializer.data)
        except Patient.DoesNotExist:
            return Response(
                {'detail': 'Paciente no encontrado'},
                status=status.HTTP_404_NOT_FOUND
            )


class AvailabilityViewSet(viewsets.ModelViewSet):
    """ViewSet para disponibilidad de doctores"""
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Solo doctores pueden crear disponibilidad"""
        try:
            doctor = Doctor.objects.get(user=self.request.user)
            serializer.save(doctor=doctor)
        except Doctor.DoesNotExist:
            return Response(
                {'detail': 'Solo doctores pueden crear disponibilidad'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    def get_queryset(self):
        """Filtra disponibilidad por doctor si se proporciona query param"""
        queryset = Availability.objects.all()
        doctor_id = self.request.query_params.get('doctor_id', None)
        if doctor_id is not None:
            queryset = queryset.filter(doctor_id=doctor_id)
        return queryset


class AppointmentViewSet(viewsets.ModelViewSet):
    """ViewSet para citas médicas"""
    queryset = Appointment.objects.all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['appointment_date', 'status']
    
    def get_serializer_class(self):
        """Usa serializador detallado para retrieve"""
        if self.action == 'retrieve':
            return AppointmentDetailSerializer
        return AppointmentSerializer
    
    def get_queryset(self):
        """Filtra citas según el usuario autenticado"""
        user = self.request.user
        
        # Si es doctor
        try:
            doctor = Doctor.objects.get(user=user)
            return Appointment.objects.filter(doctor=doctor)
        except Doctor.DoesNotExist:
            pass
        
        # Si es paciente
        try:
            patient = Patient.objects.get(user=user)
            return Appointment.objects.filter(patient=patient)
        except Patient.DoesNotExist:
            pass
        
        # Si es admin, retorna todas
        if user.is_staff:
            return Appointment.objects.all()
        
        return Appointment.objects.none()
    
    def perform_create(self, serializer):
        """Crea una nueva cita"""
        try:
            patient = Patient.objects.get(user=self.request.user)
            serializer.save(patient=patient)
        except Patient.DoesNotExist:
            return Response(
                {'detail': 'Solo pacientes pueden agendar citas'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'])
    def confirm(self, request, pk=None):
        """Doctor confirma una cita"""
        appointment = self.get_object()
        try:
            doctor = Doctor.objects.get(user=request.user)
            if appointment.doctor != doctor:
                return Response(
                    {'detail': 'No tienes permiso para confirmar esta cita'},
                    status=status.HTTP_403_FORBIDDEN
                )
            appointment.status = 'confirmed'
            appointment.save()
            return Response(AppointmentSerializer(appointment).data)
        except Doctor.DoesNotExist:
            return Response(
                {'detail': 'Solo doctores pueden confirmar citas'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Doctor marca una cita como completada"""
        appointment = self.get_object()
        try:
            doctor = Doctor.objects.get(user=request.user)
            if appointment.doctor != doctor:
                return Response(
                    {'detail': 'No tienes permiso para completar esta cita'},
                    status=status.HTTP_403_FORBIDDEN
                )
            appointment.status = 'completed'
            appointment.save()
            return Response(AppointmentSerializer(appointment).data)
        except Doctor.DoesNotExist:
            return Response(
                {'detail': 'Solo doctores pueden completar citas'},
                status=status.HTTP_403_FORBIDDEN
            )
    
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        """Cancela una cita"""
        appointment = self.get_object()
        
        # Verificar permisos
        try:
            user_doctor = Doctor.objects.get(user=request.user)
            if appointment.doctor != user_doctor:
                return Response(
                    {'detail': 'No tienes permiso para cancelar esta cita'},
                    status=status.HTTP_403_FORBIDDEN
                )
        except Doctor.DoesNotExist:
            try:
                user_patient = Patient.objects.get(user=request.user)
                if appointment.patient != user_patient:
                    return Response(
                        {'detail': 'No tienes permiso para cancelar esta cita'},
                        status=status.HTTP_403_FORBIDDEN
                    )
            except Patient.DoesNotExist:
                return Response(
                    {'detail': 'No tienes permiso'},
                    status=status.HTTP_403_FORBIDDEN
                )
        
        appointment.status = 'cancelled'
        appointment.save()
        return Response(AppointmentSerializer(appointment).data)
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Obtiene citas próximas (no completadas ni canceladas)"""
        queryset = self.get_queryset()
        now = timezone.now()
        upcoming = queryset.filter(
            appointment_date__gte=now,
            status__in=['pending', 'confirmed']
        ).order_by('appointment_date')
        serializer = self.get_serializer(upcoming, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def past(self, request):
        """Obtiene citas pasadas (completadas)"""
        queryset = self.get_queryset()
        past = queryset.filter(status='completed').order_by('-appointment_date')
        serializer = self.get_serializer(past, many=True)
        return Response(serializer.data)


class RatingViewSet(viewsets.ModelViewSet):
    """ViewSet para calificaciones"""
    queryset = Rating.objects.all()
    serializer_class = RatingSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Solo el paciente de la cita puede crear una calificación"""
        appointment_id = self.request.data.get('appointment')
        appointment = get_object_or_404(Appointment, id=appointment_id)
        
        try:
            patient = Patient.objects.get(user=self.request.user)
            if appointment.patient != patient:
                return Response(
                    {'detail': 'Solo el paciente puede calificar la cita'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.save(patient=patient, doctor=appointment.doctor)
        except Patient.DoesNotExist:
            return Response(
                {'detail': 'Solo pacientes pueden calificar citas'},
                status=status.HTTP_403_FORBIDDEN
            )


class VirtualMeetingLinkViewSet(viewsets.ModelViewSet):
    """ViewSet para enlaces de reuniones virtuales"""
    queryset = VirtualMeetingLink.objects.all()
    serializer_class = VirtualMeetingLinkSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def perform_create(self, serializer):
        """Solo doctores pueden crear enlaces de reuniones"""
        try:
            doctor = Doctor.objects.get(user=self.request.user)
            appointment_id = self.request.data.get('appointment')
            appointment = get_object_or_404(Appointment, id=appointment_id)
            
            if appointment.doctor != doctor:
                return Response(
                    {'detail': 'No tienes permiso para agregar enlace a esta cita'},
                    status=status.HTTP_403_FORBIDDEN
                )
            serializer.save()
        except Doctor.DoesNotExist:
            return Response(
                {'detail': 'Solo doctores pueden crear enlaces'},
                status=status.HTTP_403_FORBIDDEN
            )

