from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils import timezone
from datetime import timedelta
# Create your models here.
class Address(models.Model):
    house_no = models.CharField(max_length=50,null=True,blank=True)
    area = models.CharField(max_length=50,null=True,blank=True)
    landmark = models.CharField(max_length=50,null=True,blank=True)
    street = models.CharField(max_length=50,null=True,blank=True)
    city = models.CharField(max_length=50,null=True,blank=True)
    state = models.CharField(max_length=50,null=True, blank=True)
    country = models.CharField(max_length=50,null=True,blank=True)
    pin_code = models.CharField(max_length=50,null=True,blank=True)

class Organisation(models.Model):
    name = models.CharField(max_length = 50, unique = True)
    email = models.EmailField(unique = True)
    mobile_number = models.CharField(max_length = 15,unique = True)
    gst_no = models.CharField(max_length=30, unique = True)
    address = models.ForeignKey(Address, on_delete=models.PROTECT, related_name='org_address')

class User(AbstractUser):
    mobile_number = models.CharField(max_length = 15,unique = True)
    email = models.EmailField(unique = True)
    dob = models.DateField()
    address = models.ForeignKey(Address, on_delete=models.CASCADE ,null=True, blank=True)
    
    def __str__(self):
        return self.username
    

class Campaign(models.Model):
    name = models.CharField(max_length=255)
    description = models.TextField()
    areas = models.CharField(max_length=255)
    patient_count = models.IntegerField()
    template = models.TextField()
    status = models.CharField(max_length=50)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    scheduled_at = models.DateTimeField()

    def __str__(self):
        return self.name 


class Day(models.Model):
    class Choices(models.TextChoices):
        MONDAY     = "MON", "Monday",
        TUESDAY    = "TUE", "Tuesday",
        WEDNESDAY  = "WED", "Wednesday",
        THURSDAY   = "THU", "Thursday",
        FRIDAY     = "FRI", "Friday",
        SATURDAY   = "SAT", "Saturday",
        SUNDAY     = "SUN", "Sunday"
    
    day_of_week = models.CharField(max_length=3, choices=Choices.choices, unique=True)
    def __str__(self):
        return self.day_of_week


class PasswordReset(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    otp_code = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_used = models.BooleanField(default=False)

    def is_valid(self):
        return not self.is_used and timezone.now() < self.created_at + timedelta(minutes=10)
