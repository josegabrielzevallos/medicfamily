from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator


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


class Appointment(models.Model):
    """Cita médica."""
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE, related_name='appointments')
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='appointments')
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
    """Calificaciones y comentarios de pacientes."""
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name='rating')
    patient = models.ForeignKey('patients.Patient', on_delete=models.CASCADE)
    doctor = models.ForeignKey('doctors.Doctor', on_delete=models.CASCADE, related_name='ratings')
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        unique_together = ('appointment', 'patient', 'doctor')
    
    def __str__(self):
        return f"Rating {self.rating}/5 for {self.doctor}"
