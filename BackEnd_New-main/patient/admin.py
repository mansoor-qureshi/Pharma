from django.contrib import admin
from .models import Patient,  Appointment, PatientBodyDetails, Prescription, Address, MedicalObservation, PrescribedMedication

# Register your models here.

admin.site.register(Patient)
admin.site.register(Appointment)
admin.site.register(PatientBodyDetails)
admin.site.register(Prescription)
admin.site.register(Address)
admin.site.register(MedicalObservation)
admin.site.register(PrescribedMedication)
