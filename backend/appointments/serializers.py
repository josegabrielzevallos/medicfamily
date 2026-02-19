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
        fields = ['id', 'doctor', 'doctor_id', 'day_of_week', 'start_time', 'end_time', 'is_available']
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
        write_only=True
    )
    doctor_id = serializers.PrimaryKeyRelatedField(
        queryset=Doctor.objects.all(),
        source='doctor',
        write_only=True
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
