from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator
from django.utils import timezone

# Opciones para especialidades
SPECIALTY_CHOICES = [
    ('cardiologia', 'Cardiología'),
    ('dermatologia', 'Dermatología'),
    ('pediatria', 'Pediatría'),
    ('psicologia', 'Psicología'),
    ('odontologia', 'Odontología'),
    ('oftalmologia', 'Oftalmología'),
    ('otorinolaringologia', 'Otorrinolaringología'),
    ('traumatologia', 'Traumatología'),
    ('neurologia', 'Neurología'),
    ('medicina_general', 'Medicina General'),
]

APPOINTMENT_STATUS = [
    ('pending', 'Pendiente'),
    ('confirmed', 'Confirmada'),
    ('completed', 'Completada'),
    ('cancelled', 'Cancelada'),
]

APPOINTMENT_TYPE = [
    ('presencial', 'Presencial'),
    ('virtual', 'Virtual'),
]


class Specialty(models.Model):
    """Especialidades médicas disponibles"""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name_plural = "Specialties"
    
    def __str__(self):
        return self.name


class Doctor(models.Model):
    """Perfil de doctor"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True)
    phone = models.CharField(max_length=20)
    address = models.TextField()
    license_number = models.CharField(max_length=50, unique=True)
    medical_registration = models.CharField(max_length=50, unique=True)
    bio = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='doctor_profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"
    
    def get_average_rating(self):
        """Obtiene la calificación promedio del doctor"""
        ratings = self.ratings.all()
        if ratings.exists():
            return sum(r.rating for r in ratings) / len(ratings)
        return 0


class Patient(models.Model):
    """Perfil de paciente"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='patient_profile')
    phone = models.CharField(max_length=20)
    date_of_birth = models.DateField()
    blood_type = models.CharField(max_length=5, choices=[('O+', 'O+'), ('O-', 'O-'), ('A+', 'A+'), ('A-', 'A-'), ('B+', 'B+'), ('B-', 'B-'), ('AB+', 'AB+'), ('AB-', 'AB-')])
    allergies = models.TextField(blank=True, null=True)
    medical_conditions = models.TextField(blank=True, null=True)
    emergency_contact = models.CharField(max_length=100, blank=True, null=True)
    profile_image = models.ImageField(upload_to='patient_profiles/', blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.user.first_name} {self.user.last_name}"


class Availability(models.Model):
    """Horarios de disponibilidad del doctor"""
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(choices=[(i, day) for i, day in enumerate(['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'])])
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    
    class Meta:
        unique_together = ('doctor', 'day_of_week', 'start_time', 'end_time')
    
    def __str__(self):
        days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        return f"{self.doctor} - {days[self.day_of_week]} {self.start_time} - {self.end_time}"


class Appointment(models.Model):
    """Cita médica"""
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='appointments')
    appointment_date = models.DateTimeField()
    appointment_type = models.CharField(max_length=20, choices=APPOINTMENT_TYPE, default='presencial')
    status = models.CharField(max_length=20, choices=APPOINTMENT_STATUS, default='pending')
    reason = models.TextField()
    notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-appointment_date']
    
    def __str__(self):
        return f"Cita {self.patient} - {self.doctor} ({self.appointment_date})"


class VirtualMeetingLink(models.Model):
    """Enlaces para citas virtuales"""
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='virtual_meeting')
    meeting_link = models.URLField()
    meeting_id = models.CharField(max_length=100)
    password = models.CharField(max_length=100, blank=True, null=True)
    meeting_platform = models.CharField(max_length=50, choices=[('zoom', 'Zoom'), ('google_meet', 'Google Meet'), ('teams', 'Microsoft Teams')])
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Meeting for {self.appointment}"


class Rating(models.Model):
    """Calificaciones y comentarios de pacientes"""
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='rating')
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('appointment', 'patient', 'doctor')
    
    def __str__(self):
        return f"Rating {self.rating}/5 for {self.doctor}"
