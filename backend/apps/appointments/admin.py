from django.contrib import admin
from .models import Appointment, VirtualMeetingLink, Rating


@admin.register(Appointment)
class AppointmentAdmin(admin.ModelAdmin):
    list_display = ('id', 'patient', 'doctor', 'appointment_date', 'status')
    list_filter = ('status',)
    search_fields = ('patient__user__email', 'doctor__user__email')
    ordering = ('-appointment_date',)


admin.site.register(VirtualMeetingLink)
admin.site.register(Rating)
