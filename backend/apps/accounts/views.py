import traceback
import urllib.request as _urllib
import json as _json

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User

from apps.doctors.models import Doctor
from apps.patients.models import Patient


@api_view(['POST'])
@permission_classes([AllowAny])
def custom_refresh_token(request):
    """Refresca el access token usando el refresh token."""
    refresh = request.data.get('refresh')
    if not refresh:
        return Response({'detail': 'Refresh token es requerido'}, status=status.HTTP_400_BAD_REQUEST)
    try:
        refresh_token = RefreshToken(refresh)
        return Response({
            'access': str(refresh_token.access_token),
            'refresh': refresh,
        }, status=status.HTTP_200_OK)
    except Exception:
        return Response({'detail': 'Refresh token inválido o expirado'}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    """Registra un nuevo usuario (paciente o doctor básico)."""
    try:
        email = request.data.get('email', '').strip()
        password = request.data.get('password')
        first_name = request.data.get('first_name', '')
        last_name = request.data.get('last_name', '')
        user_type = request.data.get('user_type', 'patient')

        username = request.data.get('username', '').strip()
        if not username:
            base = email.split('@')[0] if email else 'user'
            username = base
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base}{counter}"
                counter += 1

        if not email or not password:
            return Response({'detail': 'Email y contraseña son requeridos'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({'detail': 'El usuario ya existe'}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(email=email).exists():
            return Response({'detail': 'El email ya está registrado'}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(
            username=username, email=email, password=password,
            first_name=first_name, last_name=last_name,
        )

        if user_type == 'doctor':
            Doctor.objects.create(user=user)
        else:
            Patient.objects.create(user=user)

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
        return Response({'detail': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def custom_login(request):
    """Login con username/email y password. Devuelve JWT + datos del perfil."""
    try:
        username_or_email = request.data.get('username')
        password = request.data.get('password')

        if not username_or_email or not password:
            return Response(
                {'detail': 'Username/email y password son requeridos'},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = None
        try:
            user = User.objects.get(username=username_or_email)
        except User.DoesNotExist:
            try:
                user = User.objects.get(email=username_or_email)
            except User.DoesNotExist:
                return Response({'detail': 'Usuario o contraseña incorrectos'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.check_password(password):
            return Response({'detail': 'Usuario o contraseña incorrectos'}, status=status.HTTP_401_UNAUTHORIZED)

        if not user.is_active:
            return Response({'detail': 'Tu cuenta está desactivada'}, status=status.HTTP_403_FORBIDDEN)

        refresh = RefreshToken.for_user(user)

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
        traceback.print_exc()
        return Response({'detail': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['POST'])
@permission_classes([AllowAny])
def google_login(request):
    """Login / registro con Google OAuth. Verifica el ID token o access token de Google."""
    try:
        from google.oauth2 import id_token
        from google.auth.transport import requests as google_requests
        from decouple import config as decouple_config

        credential = request.data.get('credential')
        access_token = request.data.get('access_token')
        user_type = request.data.get('user_type', 'patient')

        if not credential and not access_token:
            return Response({'error': 'Token de Google requerido'}, status=status.HTTP_400_BAD_REQUEST)

        email = first_name = last_name = ''

        if credential:
            google_client_id = decouple_config('GOOGLE_CLIENT_ID', default='')
            if not google_client_id:
                return Response(
                    {'error': 'GOOGLE_CLIENT_ID no configurado en el servidor'},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )
            idinfo = id_token.verify_oauth2_token(
                credential, google_requests.Request(), google_client_id, clock_skew_in_seconds=10
            )
            email = idinfo.get('email', '')
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
        else:
            req = _urllib.Request(
                f'https://www.googleapis.com/oauth2/v1/userinfo?access_token={access_token}'
            )
            with _urllib.urlopen(req) as resp:
                info = _json.loads(resp.read().decode())
            email = info.get('email', '')
            first_name = info.get('given_name', '')
            last_name = info.get('family_name', '')

        if not email:
            return Response({'error': 'No se pudo obtener el email de Google'}, status=status.HTTP_400_BAD_REQUEST)

        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            base_username = email.split('@')[0]
            username = base_username
            counter = 1
            while User.objects.filter(username=username).exists():
                username = f"{base_username}{counter}"
                counter += 1
            user = User.objects.create_user(
                username=username, email=email,
                first_name=first_name, last_name=last_name,
            )
            user.set_unusable_password()
            user.save()
            if user_type == 'patient':
                Patient.objects.get_or_create(user=user)

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
        return Response({'error': f'Token de Google inválido: {str(e)}'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception as e:
        traceback.print_exc()
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
