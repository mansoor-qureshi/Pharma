from django.contrib import admin
from .models import Doctor,Specialization,Department,DayTimeAvailability

# Register your models here.
admin.site.register(Doctor)
admin.site.register(Specialization)
admin.site.register(Department)
admin.site.register(DayTimeAvailability)
