from rest_framework import viewsets, status, permissions, filters, parsers
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenRefreshView
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
    VirtualMeetingLinkSerializer, RatingSerializer, DoctorRegisterSerializer
)
from .permissions import IsDoctor, IsPatient, IsAdminOrReadOnly


@api_view(['POST'])
@permission_classes([AllowAny])
def custom_refresh_token(request):
    """Endpoint personalizado de refresh de tokens con logs"""
    try:
        print(f"📝 Refresh token request: {request.data}")
        
        refresh = request.data.get('refresh')
        
        if not refresh:
            print(f"❌ Refresh token vacío")
            return Response(
                {'detail': 'Refresh token es requerido'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        print(f"✅ Refresh token recibido: {refresh[:30]}...")
        
        try:
            refresh_token = RefreshToken(refresh)
            new_access = str(refresh_token.access_token)
            
            print(f"✅ Token refrescado exitosamente")
            
            return Response({
                'access': new_access,
                'refresh': refresh,
            }, status=status.HTTP_200_OK)
            
        except Exception as e:
            print(f"❌ Error al refrescar token: {str(e)}")
            return Response(
                {'detail': 'Refresh token inválido o expirado'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
    except Exception as e:
        print(f"❌ Error general en refresh: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Endpoint para registrar nuevos usuarios (paciente o doctor)"""
    try:
        email     = request.data.get('email', '').strip()
        password  = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name  = request.data.get('last_name', '')
        user_type  = request.data.get('user_type', 'patient')  # 'patient' o 'doctor'

        # username: usar el provisto o auto-generar desde email
        username = request.data.get('username', '').strip()
        if not username:
            base = email.split('@')[0] if email else 'user'
            username = base
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{counter}"
                counter += 1

        if not email or not password:
            return Response(
                {'detail': 'Email y contraseña son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )

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
                'name': f"{user.first_name} {user.last_name}".strip(),
                'role': user_type,
            }
        }, status=status.HTTP_201_CREATED)
    
    except Exception as e:
        return Response(
            {'detail': str(e)},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def register_doctor(request):
    """Endpoint específico para registrar doctores con información profesional"""
    print(f"📝 Datos recibidos: {request.data}")
    serializer = DoctorRegisterSerializer(data=request.data)
    
    if serializer.is_valid():
        try:
            print("✅ Serializer válido")
            user = serializer.save()
            print(f"✅ Usuario creado: {user.username}")
            
            refresh = RefreshToken.for_user(user)

            # Obtener datos del perfil de doctor recién creado
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
            print(f"❌ Error al guardar: {str(e)}")
            import traceback
            traceback.print_exc()
            return Response(
                {'detail': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )
    
    print(f"❌ Errores en serializer: {serializer.errors}")
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    """Endpoint personalizado de login que retorna tokens e información del usuario"""
    try:
        print(f"📝 Login request: {request.data}")
        
        username_or_email = request.data.get('username')
        password = request.data.get('password')
        
        if not username_or_email or not password:
            return Response(
                {'detail': 'Username/email y password son requeridos'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Intentar encontrar el usuario por username o email
        user = None
        try:
            # Primero intenta como username
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            # Si no existe, intenta como email
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                print(f"❌ Usuario no encontrado: {username_or_email}")
                return Response(
                    {'detail': 'Usuario o contraseña incorrectos'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        # Validar password
        if not user.check_password(password):
            print(f"❌ Contraseña incorrecta para: {user.username}")
            return Response(
                {'detail': 'Usuario o contraseña incorrectos'},
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        # Validar que el usuario esté activo
        if not user.is_active:
            return Response(
                {'detail': 'Tu cuenta está desactivada'},
                status=status.HTTP_403_FORBIDDEN
            )
        
        print(f"✅ Login exitoso para: {user.username}")
        
        # Generar tokens
        refresh = RefreshToken.for_user(user)
        
        # Detectar el role del usuario e incluir datos del perfil
        role = 'patient'
        doctor_data = {}
        try:
            doctor_profile = Doctor.objects.select_related('specialty').get(user=user)
            role = 'doctor'
            doctor_data = {
                'doctor_id': doctor_profile.id,
                'specialty': doctor_profile.specialty.name if doctor_profile.specialty else '',
                'phone': doctor_profile.phone,
                'address': doctor_profile.address,
                'bio': doctor_profile.bio or '',
                'is_verified': doctor_profile.is_verified,
            }
        except Doctor.DoesNotExist:
            pass
        
        return Response({
            'access': str(refresh.access_token),
            'refresh': str(refresh),
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'first_name': user.first_name,
                'last_name': user.last_name,
                'name': f"{user.first_name} {user.last_name}".strip(),
                'role': role,
                **doctor_data,
            }
        }, status=status.HTTP_200_OK)
        
    except Exception as e:
        print(f"❌ Error en login: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response(
            {'detail': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """Login / registro con Google OAuth. Verifica el ID token de Google y devuelve JWT."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        from decouple import config as decouple_config

        credential   = request.data.get('credential')    # ID token (GoogleLogin component)
        access_token = request.data.get('access_token')  # Access token (useGoogleLogin hook)
        user_type    = request.data.get('user_type', 'patient')

        if not credential and not access_token:
            return Response({'error': 'Token de Google requerido'}, status=status.HTTP_400_BAD_REQUEST)

        email = first_name = last_name = ''

        if credential:
            # Flujo ID token — verificar con google-auth
            google_client_id = decouple_config('GOOGLE_CLIENT_ID', default='')
            if not google_client_id:
                return Response({'error': 'GOOGLE_CLIENT_ID no configurado en el servidor'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            idinfo     = id_token.verify_oauth2_token(credential, google_requests.Request(), google_client_id, clock_skew_in_seconds=10)
            email      = idinfo.get('email', '')
            first_name = idinfo.get('given_name', '')
            last_name  = idinfo.get('family_name', '')
        else:
            # Flujo access_token — llamar al userinfo endpoint de Google
            import urllib.request as _urllib
            import json as _json
            req = _urllib.Request(f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}')
            with _urllib.urlopen(req) as resp:
                info = _json.loads(resp.read().decode())
            email      = info.get('email', '')
            first_name = info.get('given_name', '')
            last_name  = info.get('family_name', '')

        if not email:
            return Response({'error': 'No se pudo obtener el email de Google'}, status=status.HTTP_400_BAD_REQUEST)

        # Buscar o crear el usuario por email
        try:
            user = User.objects.get(email=email)
            print(f"✅ Usuario existente encontrado por Google: {user.username}")
        except User.DoesNotExist:
            # Generar username único
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1

            user = User.objects.create_user(
                username=username,
                email=email,
                first_name=first_name,
                last_name=last_name,
            )
            user.set_unusable_password()
            user.save()
            print(f"✅ Nuevo usuario creado via Google: {user.username}")

            # Crear perfil según el tipo solicitado
            if user_type == 'patient':
                Patient.objects.get_or_create(user=user)

        # Determinar el rol actual del usuario
        role = 'patient'
        doctor_data = {}
        try:
            doctor_profile = Doctor.objects.select_related('specialty').get(user=user)
            role = 'doctor'
            doctor_data = {
                'doctor_id': doctor_profile.id,
                'specialty': doctor_profile.specialty.name if doctor_profile.specialty else '',
                'phone': doctor_profile.phone,
                'address': doctor_profile.address,
                'bio': doctor_profile.bio or '',
                'is_verified': doctor_profile.is_verified,
            }
        except Doctor.DoesNotExist:
            Patient.objects.get_or_create(user=user)

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
                'name': f"{user.first_name} {user.last_name}".strip(),
                'role': role,
                **doctor_data,
            }
        }, status=status.HTTP_200_OK)

    except ValueError as e:
        print(f"❌ Token de Google inválido: {str(e)}")
        return Response({'error': f'Token de Google inválido: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        print(f"❌ Error en google_login: {str(e)}")
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


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

    @action(detail=False, methods=['get'], permission_classes=[IsAuthenticated])
    def my_profile(self, request):
        """Retorna el perfil completo del doctor autenticado"""
        try:
            doctor = Doctor.objects.select_related('user', 'specialty').get(user=request.user)
            serializer = DoctorSerializer(doctor)
            return Response(serializer.data)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Perfil de doctor no encontrado'}, status=status.HTTP_404_NOT_FOUND)

    @action(detail=False, methods=['patch'], permission_classes=[IsAuthenticated],
            parser_classes=[parsers.MultiPartParser, parsers.FormParser])
    def upload_photo(self, request):
        """Sube o actualiza la foto de perfil del doctor autenticado"""
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Perfil de doctor no encontrado'}, status=status.HTTP_404_NOT_FOUND)

        if 'photo' not in request.FILES:
            return Response({'detail': 'No se proporcionó ninguna imagen (campo: photo)'}, status=status.HTTP_400_BAD_REQUEST)

        photo = request.FILES['photo']
        # Validate type
        if not photo.content_type.startswith('image/'):
            return Response({'detail': 'El archivo debe ser una imagen'}, status=status.HTTP_400_BAD_REQUEST)
        # Validate size (5 MB max)
        if photo.size > 5 * 1024 * 1024:
            return Response({'detail': 'La imagen no puede superar los 5 MB'}, status=status.HTTP_400_BAD_REQUEST)

        doctor.profile_image = photo
        doctor.save(update_fields=['profile_image'])
        serializer = DoctorSerializer(doctor)
        return Response(serializer.data)

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

    @action(detail=False, methods=['get'])
    def for_doctor(self, request):
        """Retorna la lista de pacientes que tienen o han tenido citas con el doctor autenticado.
        Permite búsqueda con ?q=nombre"""
        try:
            doctor = Doctor.objects.get(user=request.user)
        except Doctor.DoesNotExist:
            return Response({'detail': 'Solo doctores pueden ver esta lista.'}, status=status.HTTP_403_FORBIDDEN)

        patient_ids = Appointment.objects.filter(doctor=doctor).values_list('patient_id', flat=True).distinct()
        queryset = Patient.objects.filter(id__in=patient_ids)

        q = request.query_params.get('q', '').strip()
        if q:
            queryset = queryset.filter(
                Q(user__first_name__icontains=q) |
                Q(user__last_name__icontains=q) |
                Q(user__email__icontains=q)
            )

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)


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
        """Crea una nueva cita. Admite doctor o paciente como creador."""
        user = self.request.user

        # Si es doctor: puede crear citas para cualquier paciente (especificando patient_id)
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

        # Si es paciente: se asigna automáticamente como paciente
        try:
            patient = Patient.objects.get(user=user)
            serializer.save(patient=patient)
        except Patient.DoesNotExist:
            from rest_framework.exceptions import ValidationError
            raise ValidationError({'detail': 'Solo pacientes o doctores pueden agendar citas.'})
    
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

