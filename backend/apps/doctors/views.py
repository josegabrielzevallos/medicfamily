import traceback
from datetime import date, timedelta, datetime as dt_datetime

from rest_framework import viewsets, status, permissions, filters, parsers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework_simplejwt.tokens import RefreshToken

from apps.doctors.models import Specialty, Doctor, Availability
from apps.doctors.serializers import (
    SpecialtySerializer, DoctorSerializer,
    AvailabilitySerializer, DoctorRegisterSerializer,
)
from apps.doctors.permissions import IsDoctor, IsAdminOrReadOnly


@api_view(['POST'])
@permission_classes([AllowAny])
def register_doctor(request):
    """Registro completo de doctor con información profesional."""
    serializer = DoctorRegisterSerializer(data=request.data)
    if serializer.is_valid():
        try:
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            doctor_profile = Doctor.objects.select_related('specialty').get(user=user)
            return Response({
                'access': str(refresh.access_token),
                'refresh': str(refresh),
                'user': {
                    'id': user.id,
                    'doctor_id': doctor_profile.id,
                    'username': user.username,
                    'email': user.email,
                    'first_name': user.first_name,
                    'last_name': user.last_name,
                    'name': f"{user.first_name} {user.last_name}".strip(),
                    'specialty': doctor_profile.specialty.name if doctor_profile.specialty else '',
                    'phone': doctor_profile.phone,
                    'address': doctor_profile.address,
                    'role': 'doctor',
                }
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            traceback.print_exc()
            return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class SpecialtyViewSet(viewsets.ReadOnlyModelViewSet):
    """Especialidades médicas — solo lectura."""
    queryset = Specialty.objects.all()
    serializer_class = SpecialtySerializer
    permission_classes = [permissions.AllowAny]
    filter_backends = [filters.SearchFilter]
    search_fields = ['name', 'description']


class DoctorViewSet(viewsets.ModelViewSet):
    """CRUD de doctores."""
    queryset = Doctor.objects.all()
    serializer_class = DoctorSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['user__first_name', 'user__last_name', 'specialty__name']
    ordering_fields = ['consultation_fee', 'created_at']

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_profile(self, request):
        """Retorna el perfil completo del doctor autenticado."""
        try:
            doctor = Doctor.objects.select_related('user', 'specialty').get(user=request.user)
            return Response(DoctorSerializer(doctor).data)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Perfil de doctor no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated],
            parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def upload_photo(self, request):
        """Sube o actualiza la foto de perfil del doctor autenticado."""
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Perfil de doctor no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if 'photo' not in request.FILES:
            return Response(
                {'detail': 'No se proporcionó ninguna imagen (campo: photo)'},
                status=status.HTTP_400_BAD_REQUEST,
            )
        photo = request.FILES['photo']
        if not photo.content_type.startswith('image/'):
            return Response({'detail': 'El archivo debe ser una imagen'}, status=status.HTTP_400_BAD_REQUEST)
        if photo.size > 5 * 1024 * 1024:
            return Response({'detail': 'La imagen no puede superar los 5 MB'}, status=status.HTTP_400_BAD_REQUEST)

        doctor.profile_image = photo
        doctor.save(update_fields=['profile_image'])
        return Response(DoctorSerializer(doctor).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def verify(self, request, pk=None):
        """Admin verifica un doctor."""
        if not request.user.is_staff:
            return Response({'detail': 'Solo administradores pueden verificar doctores.'}, status=status.HTTP_403_FORBIDDEN)
        doctor = self.get_object()
        doctor.is_verified = True
        doctor.save(update_fields=['is_verified'])
        return Response(DoctorSerializer(doctor).data)

    @action(detail=True, methods=['post'], permission_classes=[IsAuthenticated])
    def reject(self, request, pk=None):
        """Admin rechaza (desverifica) un doctor."""
        if not request.user.is_staff:
            return Response({'detail': 'Solo administradores pueden rechazar doctores.'}, status=status.HTTP_403_FORBIDDEN)
        doctor = self.get_object()
        doctor.is_verified = False
        doctor.save(update_fields=['is_verified'])
        return Response(DoctorSerializer(doctor).data)

    @action(detail=True, methods=['get'])
    def appointments(self, request, pk=None):
        """Obtiene todas las citas de un doctor."""
        from apps.appointments.serializers import AppointmentSerializer
        doctor = self.get_object()
        serializer = AppointmentSerializer(doctor.appointments.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def availability(self, request, pk=None):
        """Obtiene la disponibilidad de un doctor."""
        doctor = self.get_object()
        serializer = AvailabilitySerializer(doctor.availabilities.all(), many=True)
        return Response(serializer.data)

    @action(detail=True, methods=['get'])
    def ratings(self, request, pk=None):
        """Obtiene las calificaciones de un doctor."""
        from apps.appointments.serializers import RatingSerializer
        doctor = self.get_object()
        serializer = RatingSerializer(doctor.ratings.all(), many=True)
        return Response(serializer.data)


class AvailabilityViewSet(viewsets.ModelViewSet):
    """Disponibilidad de doctores."""
    queryset = Availability.objects.all()
    serializer_class = AvailabilitySerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_permissions(self):
        if self.action == 'upcoming_slots':
            return [permissions.AllowAny()]
        return super().get_permissions()

    def perform_create(self, serializer):
        try:
            doctor = Doctor.objects.get(user=self.request.user)
            serializer.save(doctor=doctor)
        except Doctor.DoesNotExist:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('Solo doctores pueden crear disponibilidad.')

    def get_queryset(self):
        queryset = Availability.objects.all()
        doctor_id = self.request.query_params.get('doctor_id')
        appointment_type = self.request.query_params.get('appointment_type')
        if doctor_id is not None:
            queryset = queryset.filter(doctor_id=doctor_id)
        if appointment_type is not None:
            queryset = queryset.filter(appointment_type=appointment_type)
        return queryset

    @action(detail=False, methods=['get'], url_path='upcoming_slots')
    def upcoming_slots(self, request):
        """
        Slots disponibles para los próximos N días de un doctor.
        Params: doctor_id (requerido), appointment_type (default presencial), days (default 3)
        """
        from apps.appointments.models import Appointment

        doctor_id = request.query_params.get('doctor_id')
        appt_type = request.query_params.get('appointment_type', 'presencial')
        try:
            days_ahead = int(request.query_params.get('days', 3))
        except (ValueError, TypeError):
            days_ahead = 3

        if not doctor_id:
            return Response({'error': 'doctor_id es requerido'}, status=400)

        try:
            doctor = Doctor.objects.get(id=doctor_id)
        except Doctor.DoesNotExist:
            return Response({'error': 'Doctor no encontrado'}, status=404)

        today = date.today()
        MONTH_ABBR = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
        result = []

        for i in range(days_ahead):
            target_date = today + timedelta(days=i)
            dow = target_date.weekday()

            avail = doctor.availabilities.filter(
                day_of_week=dow, is_available=True, appointment_type=appt_type,
            ).first()

            if not avail:
                day_slots = []
            else:
                slots = []
                current = dt_datetime.combine(target_date, avail.start_time)
                end_dt = dt_datetime.combine(target_date, avail.end_time)
                while current < end_dt:
                    slots.append(current.strftime('%H:%M'))
                    current += timedelta(hours=1)

                booked_times = {
                    b.strftime('%H:%M')
                    for b in Appointment.objects.filter(
                        doctor=doctor,
                        appointment_date__date=target_date,
                        appointment_type=appt_type,
                        status__in=['pending', 'confirmed'],
                    ).values_list('appointment_date', flat=True)
                }
                day_slots = [s for s in slots if s not in booked_times]

            if i == 0:
                label = 'Hoy'
            elif i == 1:
                label = 'Mañana'
            else:
                label = f'{target_date.day} {MONTH_ABBR[target_date.month - 1]}'

            result.append({
                'date': target_date.isoformat(),
                'label': label,
                'dow_label': target_date.strftime('%A'),
                'slots': day_slots,
            })

        return Response(result)
