from rest_framework import serializers
from django.contrib.auth.models import User
from .models import (
    Specialty, Doctor, Patient, Availability, Appointment, 
    VirtualMeetingLink, Rating
)


class UserSerializer(serializers.ModelSerializer):
    """Serializador para el modelo User"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class SpecialtySerializer(serializers.ModelSerializer):
    """Serializador para especialidades"""
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description']


class DoctorSerializer(serializers.ModelSerializer):
    """Serializador para doctores"""
    user = UserSerializer(read_only=True)
    specialty = SpecialtySerializer(read_only=True)
    specialty_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialty.objects.all(),
        source='specialty',
        write_only=True
    )
    average_rating = serializers.SerializerMethodField()
    
    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'specialty', 'specialty_id', 'phone', 'address',
            'license_number', 'medical_registration', 'bio', 'profile_image',
            'is_verified', 'consultation_fee', 'average_rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_average_rating(self, obj):
        return obj.get_average_rating()


class PatientSerializer(serializers.ModelSerializer):
    """Serializador para pacientes"""
    user = UserSerializer(read_only=True)
    
    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'phone', 'date_of_birth', 'blood_type',
            'allergies', 'medical_conditions', 'emergency_contact',
            'profile_image', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AvailabilitySerializer(serializers.ModelSerializer):
    """Serializador para disponibilidad del doctor"""
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        source='doctor',
        write_only=True
    )
    
    class Meta:
        model = Availability
        fields = ['id', 'doctor', 'doctor_id', 'day_of_week', 'start_time', 'end_time', 'is_available', 'appointment_type']
        read_only_fields = ['id', 'doctor']


class VirtualMeetingLinkSerializer(serializers.ModelSerializer):
    """Serializador para enlaces de reuniones virtuales"""
    class Meta:
        model = VirtualMeetingLink
        fields = ['id', 'appointment', 'meeting_link', 'meeting_id', 'password', 'meeting_platform', 'created_at']
        read_only_fields = ['id', 'created_at']


class RatingSerializer(serializers.ModelSerializer):
    """Serializador para calificaciones"""
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)
    
    class Meta:
        model = Rating
        fields = ['id', 'appointment', 'patient', 'doctor', 'doctor_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
    """Serializador para citas médicas"""
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    patient_id = serializers.PrimaryKeyRelatedField(
        queryset=Patient.objects.all(),
        source='patient',
        write_only=True,
        required=False,
    )
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        source='doctor',
        write_only=True,
        required=False,
    )
    virtual_meeting = VirtualMeetingLinkSerializer(read_only=True)
    rating = RatingSerializer(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'patient_id', 'doctor', 'doctor_id',
            'appointment_date', 'appointment_type', 'status', 'reason',
            'notes', 'virtual_meeting', 'rating', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AppointmentDetailSerializer(serializers.ModelSerializer):
    """Serializador detallado para citas (incluye información completa)"""
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    virtual_meeting = VirtualMeetingLinkSerializer(read_only=True)
    rating = RatingSerializer(read_only=True)
    
    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'appointment_date', 'appointment_type',
            'status', 'reason', 'notes', 'virtual_meeting', 'rating',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class DoctorRegisterSerializer(serializers.Serializer):
    """Serializador para registro de doctores con información adicional"""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    passwordConfirm = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)
    password2 = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    specialty = serializers.CharField(required=True)  # Puede ser string o ID
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=255, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)
    
    def validate(self, data):
        print(f"📝 Validando datos: {data}")
        
        # Aceptar passwordConfirm o password2
        password_confirm = data.get('passwordConfirm') or data.get('password2')
        
        # Validar que las contraseñas coincidan
        if password_confirm and data['password'] != password_confirm:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden'})
        
        # Validar que el email no exista
        if User.objects.filter(email=data['email']).exists():
            print(f"❌ Error: Email ya existe: {data['email']}")
            raise serializers.ValidationError({'email': 'El email ya está registrado'})
        
        return data
    
    def create(self, validated_data):
        print(f"📝 Creando usuario con datos: {validated_data}")
        
        # Generar username limpio desde nombre + apellido (ej: juan.perez)
        first = validated_data['firstName'].lower().strip().replace(' ', '')
        last = validated_data['lastName'].lower().strip().replace(' ', '')
        base_username = f"{first}.{last}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1
        
        print(f"✅ Username generado: {username}")
        
        # Crear usuario
        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['firstName'],
            last_name=validated_data['lastName']
        )
        
        print(f"✅ Usuario creado: {user.username}")
        
        # Manejar specialidad como string o ID
        specialty_input = validated_data.get('specialty')
        
        try:
            # Intentar como ID numérico
            specialty_id = int(specialty_input) if specialty_input else None
            specialty = Specialty.objects.get(id=specialty_id) if specialty_id else Specialty.objects.first()
        except (ValueError, Specialty.DoesNotExist):
            # Si falla, buscar por nombre
            specialty, _ = Specialty.objects.get_or_create(
                name=specialty_input
            )
        
        print(f"✅ Especialidad: {specialty.name if specialty else 'N/A'}")
        
        # Usar address si existe, sino usar city
        address = validated_data.get('address') or validated_data.get('city', '')
        
        # Crear perfil del doctor
        doctor = Doctor.objects.create(
            user=user,
            specialty=specialty,
            phone=validated_data.get('phone', ''),
            address=address,
            bio=validated_data.get('bio', ''),
        )
        
        print(f"✅ Doctor profile creado para: {user.username}")
        
        return user
