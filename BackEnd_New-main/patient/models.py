from typing import Iterable
from django.db import models
from doctor.models import Doctor

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

    
class Patient(models.Model):
    class Gender(models.TextChoices):
        MALE = "M","male"
        FEMALE = "F","female",
        OTHER = "O","other"
    patient_id = models.CharField(unique = True, max_length = 50)
    first_name = models.CharField(max_length = 50)
    last_name = models.CharField(max_length = 50, null=True, blank=True)
    dob = models.DateField()
    gender = models.CharField(max_length=3, choices = Gender.choices)
    mobile_number = models.CharField(max_length=15)
    email = models.EmailField()
    created_at = models.DateTimeField(auto_now_add = True)
    address=models.ForeignKey(Address, on_delete=models.SET_NULL ,null=True, blank=True)

    class Meta:
        ordering = ['-id']

    def __str__(self):
        return self.first_name  
    

class PatientBodyDetails(models.Model):
    temperature = models.CharField(max_length = 10)
    weight = models.CharField(max_length = 10)
    blood_pressure = models.CharField(max_length = 10)
    height = models.CharField(default='N/A', max_length = 10)
    pulse = models.CharField(default='N/A', max_length = 10)
    bmi = models.CharField(default='N/A', max_length = 10)
    respiration_rate = models.CharField(default='N/A', max_length = 10)
    waist_circum = models.CharField(default='N/A', max_length = 10)


class Appointment(models.Model):
    class Status(models.TextChoices):
        SCHEDULED = "SHD","scheduled"
        COMPLETED = "COM","completed"
        OVERDUE = "OD", "overdue"
    doctor = models.ForeignKey(Doctor, on_delete = models.CASCADE, related_name = 'doctor_appointments')
    patient = models.ForeignKey(Patient, on_delete = models.CASCADE, related_name = 'patient_appointments')
    status = models.CharField(max_length=3, choices=Status.choices, default=Status.SCHEDULED)
    body_details = models.ForeignKey(PatientBodyDetails, on_delete = models.SET_NULL, null = True, blank = True)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    prescription_bought = models.BooleanField(default = False)
    created_at = models.DateTimeField(auto_now_add = True)

    class Meta:
        ordering = ['-id']

def get_prescription_upload_path(instance, filename):
    return f'patient/{instance.appointment.patient.patient_id}/prescription_{instance.appointment.id}.pdf'


class Prescription(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete = models.CASCADE, related_name = 'prescription')
    url = models.TextField(max_length=1000, null=True,blank=True)
    s3_url = models.FileField(upload_to=get_prescription_upload_path, null=True,blank=True)
    
class PrescriptionBought(models.Model):
    prescription = models.OneToOneField(Prescription, on_delete = models.CASCADE, related_name = 'prescription_details')
    cost = models.DecimalField(max_digits=10,decimal_places=2)
    days = models.IntegerField()

class MedicalObservation(models.Model):
    appointment = models.OneToOneField(Appointment, on_delete=models.CASCADE, related_name="observations")
    clinical_observation = models.TextField(null=True, blank=True)
    diagnosis = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"{self.appointment.id}"
    
class PrescribedMedication(models.Model):
    medical_observation = models.ForeignKey(MedicalObservation, on_delete=models.CASCADE)
    type = models.CharField(max_length=100, null=True, blank=True)
    medicine = models.CharField(max_length=255)
    dose = models.CharField(max_length=255, null=True, blank=True)
    when = models.CharField(max_length=255, null=True, blank=True)
    frequency = models.CharField(max_length=255, null=True, blank=True)
    duration = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    def __str__(self):
        return self.medicine


    