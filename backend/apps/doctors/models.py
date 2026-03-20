from django.db import models
from django.contrib.auth.models import User


AVAILABILITY_TYPE = [
    ('presencial', 'Presencial'),
    ('virtual', 'Virtual'),
]


class Specialty(models.Model):
    """Especialidades médicas disponibles."""
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True, null=True)

    class Meta:
        verbose_name_plural = 'Specialties'

    def __str__(self):
        return self.name


class Doctor(models.Model):
    """Perfil de doctor."""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor_profile')
    specialty = models.ForeignKey(Specialty, on_delete=models.SET_NULL, null=True, blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    license_number = models.CharField(max_length=50, blank=True, null=True)
    medical_registration = models.CharField(max_length=50, blank=True, null=True)
    bio = models.TextField(blank=True, null=True)
    profile_image = models.ImageField(upload_to='doctor_profiles/', blank=True, null=True)
    is_verified = models.BooleanField(default=False)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Dr. {self.user.first_name} {self.user.last_name}"

    def get_average_rating(self):
        ratings = self.ratings.all()
        if ratings.exists():
            return sum(r.rating for r in ratings) / len(ratings)
        return 0


class Availability(models.Model):
    """Horarios de disponibilidad del doctor."""
    doctor = models.ForeignKey(Doctor, on_delete=models.CASCADE, related_name='availabilities')
    day_of_week = models.IntegerField(
        choices=[(i, day) for i, day in enumerate(
            ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        )]
    )
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)
    appointment_type = models.CharField(max_length=20, choices=AVAILABILITY_TYPE, default='presencial')

    class Meta:
        unique_together = ('doctor', 'day_of_week', 'appointment_type')

    def __str__(self):
        days = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo']
        return f"{self.doctor} - {days[self.day_of_week]} [{self.appointment_type}] {self.start_time} - {self.end_time}"
