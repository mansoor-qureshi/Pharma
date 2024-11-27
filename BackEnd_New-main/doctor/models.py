from django.db import models
from core.models import User, Address, Day, Organisation

# Create your models here.

class Specialization(models.Model):
    name = models.CharField(max_length = 100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    def __str__(self):
        return self.name
    class Meta:
        ordering = ['-id']
    
class Department(models.Model):
    name = models.CharField(max_length = 100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    def __str__(self):
        return self.name
    class Meta:
        ordering = ['-id']

class Doctor(models.Model):
    organisation = models.ForeignKey(Organisation, on_delete=models.PROTECT, related_name='doctors')
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='doctor')
    specialization = models.ForeignKey(Specialization, on_delete=models.PROTECT, related_name='specialized_doctors')
    department = models.ForeignKey(Department, on_delete=models.PROTECT, related_name='department_doctors')
    experience = models.IntegerField()
    license = models.CharField(max_length=50,unique=True)
    address = models.ForeignKey(Address,on_delete=models.PROTECT)
    op_fee = models.DecimalField(max_digits=10,decimal_places=2)
    signature = models.TextField(max_length=500,null=True,blank=True)
    
    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.user.username

class DayTimeAvailability(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.PROTECT, related_name='assigned_timeslots')
    day = models.ForeignKey(Day, on_delete=models.PROTECT, related_name = 'daily_slots')
    start_time = models.TimeField()
    end_time = models.TimeField()

    def __str__(self):
        return f"{self.doctor.user.username} - {self.day.day_of_week} :: {self.start_time}<->{self.end_time}"

class UnavailableSlot(models.Model):
    doctor = models.ForeignKey(Doctor, on_delete=models.PROTECT, related_name='unavailable_timeslots')
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()

