from django.contrib import admin
from .models import Specialty, Doctor, Patient, Availability, Appointment, VirtualMeetingLink, Rating


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display  = ('id', 'get_email', 'get_name', 'phone', 'date_of_birth', 'get_date_joined')
    search_fields = ('user__email', 'user__first_name', 'user__last_name', 'phone')
    ordering      = ('-user__date_joined',)

    def get_email(self, obj):      return obj.user.email
    def get_name(self, obj):       return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    def get_date_joined(self, obj): return obj.user.date_joined

    get_email.short_description      = 'Email'
    get_name.short_description       = 'Nombre'
    get_date_joined.short_description = 'Registrado'


@admin.register(Doctor)
class DoctorAdmin(admin.ModelAdmin):
    list_display  = ('id', 'get_email', 'get_name', 'specialty', 'is_verified', 'get_date_joined')
    search_fields = ('user__email', 'user__first_name', 'user__last_name')
    list_filter   = ('is_verified', 'specialty')
    ordering      = ('-user__date_joined',)

    def get_email(self, obj):       return obj.user.email
    def get_name(self, obj):        return f"{obj.user.first_name} {obj.user.last_name}".strip() or obj.user.username
    def get_date_joined(self, obj): return obj.user.date_joined

    get_email.short_description       = 'Email'
    get_name.short_description        = 'Nombre'
    get_date_joined.short_description = 'Registrado'


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display  = ('id', 'patient', 'doctor', 'appointment_date', 'status')
    list_filter   = ('status',)
    search_fields = ('patient__user__email', 'doctor__user__email')
    ordering      = ('-appointment_date',)


admin.site.register(Specialty)
admin.site.register(Availability)
admin.site.register(VirtualMeetingLink)
admin.site.register(Rating)
