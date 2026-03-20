from rest_framework import serializers

from apps.appointments.models import Appointment, VirtualMeetingLink, Rating
from apps.doctors.models import Doctor
from apps.patients.models import Patient
from apps.doctors.serializers import DoctorSerializer
from apps.patients.serializers import PatientSerializer


class VirtualMeetingLinkSerializer(serializers.ModelSerializer):
    class Meta:
        model = VirtualMeetingLink
        fields = ['id', 'appointment', 'meeting_link', 'meeting_id', 'password', 'meeting_platform', 'created_at']
        read_only_fields = ['id', 'created_at']


class RatingSerializer(serializers.ModelSerializer):
    doctor_name = serializers.CharField(source='doctor.user.get_full_name', read_only=True)

    class Meta:
        model = Rating
        fields = ['id', 'appointment', 'patient', 'doctor', 'doctor_name', 'rating', 'comment', 'created_at']
        read_only_fields = ['id', 'created_at']


class AppointmentSerializer(serializers.ModelSerializer):
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
            'notes', 'virtual_meeting', 'rating', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']


class AppointmentDetailSerializer(serializers.ModelSerializer):
    patient = PatientSerializer(read_only=True)
    doctor = DoctorSerializer(read_only=True)
    virtual_meeting = VirtualMeetingLinkSerializer(read_only=True)
    rating = RatingSerializer(read_only=True)

    class Meta:
        model = Appointment
        fields = [
            'id', 'patient', 'doctor', 'appointment_date', 'appointment_type',
            'status', 'reason', 'notes', 'virtual_meeting', 'rating',
            'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

