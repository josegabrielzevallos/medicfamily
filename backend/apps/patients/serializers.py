from rest_framework import serializers
from django.contrib.auth.models import User

from apps.patients.models import Patient


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'first_name', 'last_name']
        read_only_fields = ['id']


class PatientSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = Patient
        fields = [
            'id', 'user', 'phone', 'date_of_birth', 'blood_type',
            'allergies', 'medical_conditions', 'emergency_contact',
            'profile_image', 'created_at', 'updated_at',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
