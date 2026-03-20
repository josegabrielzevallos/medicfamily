from rest_framework import serializers
from django.contrib.auth.models import User

from apps.doctors.models import Specialty, Doctor, Availability


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class SpecialtySerializer(serializers.ModelSerializer):
    class Meta:
        model = Specialty
        fields = ['id', 'name', 'description']


class DoctorSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    specialty = SpecialtySerializer(read_only=True)
    specialty_id = serializers.PrimaryKeyRelatedField(
        queryset=Specialty.objects.all(),
        source='specialty',
        write_only=True,
    )
    average_rating = serializers.SerializerMethodField()

    class Meta:
        model = Doctor
        fields = [
            'id', 'user', 'specialty', 'specialty_id', 'phone', 'address',
            'license_number', 'medical_registration', 'bio', 'profile_image',
            'is_verified', 'consultation_fee', 'average_rating', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_average_rating(self, obj):
        return obj.get_average_rating()


class AvailabilitySerializer(serializers.ModelSerializer):
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        source='doctor',
        write_only=True,
    )

    class Meta:
        model = Availability
        fields = ['id', 'doctor', 'doctor_id', 'day_of_week', 'start_time', 'end_time', 'is_available', 'appointment_type']
        read_only_fields = ['id', 'doctor']


class DoctorRegisterSerializer(serializers.Serializer):
    """Registro completo de doctor con información profesional."""
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    passwordConfirm = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)
    password2 = serializers.CharField(write_only=True, min_length=8, required=False, allow_blank=True)
    firstName = serializers.CharField(max_length=150)
    lastName = serializers.CharField(max_length=150)
    phone = serializers.CharField(max_length=20, required=False, allow_blank=True)
    specialty = serializers.CharField(required=True)
    address = serializers.CharField(max_length=255, required=False, allow_blank=True)
    city = serializers.CharField(max_length=255, required=False, allow_blank=True)
    bio = serializers.CharField(required=False, allow_blank=True)

    def validate(self, data):
        password_confirm = data.get('passwordConfirm') or data.get('password2')
        if password_confirm and data['password'] != password_confirm:
            raise serializers.ValidationError({'password': 'Las contraseñas no coinciden'})
        if User.objects.filter(email=data['email']).exists():
            raise serializers.ValidationError({'email': 'El email ya está registrado'})
        return data

    def create(self, validated_data):
        first = validated_data['firstName'].lower().strip().replace(' ', '')
        last = validated_data['lastName'].lower().strip().replace(' ', '')
        base_username = f"{first}.{last}"
        username = base_username
        counter = 1
        while User.objects.filter(username=username).exists():
            username = f"{base_username}{counter}"
            counter += 1

        user = User.objects.create_user(
            username=username,
            email=validated_data['email'],
            password=validated_data['password'],
            first_name=validated_data['firstName'],
            last_name=validated_data['lastName'],
        )

        specialty_input = validated_data.get('specialty')
        try:
            specialty_id = int(specialty_input) if specialty_input else None
            specialty = Specialty.objects.get(id=specialty_id) if specialty_id else Specialty.objects.first()
        except (ValueError, Specialty.DoesNotExist):
            specialty, _ = Specialty.objects.get_or_create(name=specialty_input)

        address = validated_data.get('address') or validated_data.get('city', '')

        Doctor.objects.create(
            user=user,
            specialty=specialty,
            phone=validated_data.get('phone', ''),
            address=address,
            bio=validated_data.get('bio', ''),
        )

        return user
