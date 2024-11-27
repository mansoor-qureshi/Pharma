from datetime import date
from datetime import datetime
from rest_framework.serializers import ModelSerializer
from rest_framework import serializers
from dateutil.relativedelta import relativedelta
from .models import *
from doctor.serializers import DoctorIdNameSez, SpecializationListSez, DepartmentListSez
from inventory.models import PharmacyInvoice
from core.serializers import OrgDetailsSez, UserNameIdSez

class PrescriptionBoughtSerializer(serializers.ModelSerializer):
    appointment_id = serializers.IntegerField(write_only=True)
    days = serializers.IntegerField()
    cost = serializers.DecimalField(max_digits=10, decimal_places=2)

    class Meta:
        model = PrescriptionBought
        fields = ['appointment_id', 'days', 'cost']

    def create(self, validated_data):
        appointment_id = validated_data.pop('appointment_id')
        try:
            appointment=Appointment.objects.get(id=appointment_id)
            appointment.prescription_bought=True
            appointment.save()
            prescription = Prescription.objects.get(appointment_id=appointment_id)
            prescription_bought, created = PrescriptionBought.objects.update_or_create(
                prescription=prescription,
                defaults=validated_data
            )
            return prescription_bought
        except Prescription.DoesNotExist:
            raise serializers.ValidationError("Prescription for the given appointment does not exist.")

class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class PatientCreateSez(serializers.ModelSerializer):
    address = AddressSerializer(write_only = True, required = False)  # Nested serializer for Address

    class Meta:
        model = Patient
        exclude = ['patient_id']  

    def create(self, validated_data):

        new_count = Patient.objects.all().count() + 1
        no_of_digits = len(str(new_count))
        latest_id = 'P' + (4 - no_of_digits) * '0' + str(new_count)
        validated_data['patient_id'] = latest_id
        address_data = validated_data.pop('address',None)
        if address_data is not None:
            address = Address.objects.create(**address_data)
            patient = Patient.objects.create(**validated_data,address=address)
        else:
            patient = Patient.objects.create(**validated_data)

        return patient

# class PatientCreateSez(ModelSerializer):
#     str_len = 4
#     class Meta:
#         model = Patient
#         # fields = '__all__'
#         exclude = ['patient_id']
#     def create(self, validated_data):
#         new_count = Patient.objects.all().count()+1
#         no_of_digits = len(str(new_count))
#         latest_id = 'P' + (self.str_len-no_of_digits)*'0' +str( new_count)
#         pateint = Patient.objects.create(patient_id=latest_id,**validated_data)
#         return pateint

class PatientListSez(serializers.ModelSerializer):
    address = AddressSerializer()  # Nested serializer for Address

    class Meta:
        model = Patient
        fields = '__all__'



class PatintIdNameSez(serializers.ModelSerializer):
    age = serializers.SerializerMethodField()

    class Meta:
        model = Patient
        fields = ['id', 'patient_id', 'first_name', 'last_name', 'age', 'gender', 'mobile_number']

    def get_age(self, obj):
        today = date.today()
        age = today.year - obj.dob.year - ((today.month, today.day) < (obj.dob.month, obj.dob.day))
        return age

# class PatintIdNameSez(ModelSerializer):
#     class Meta:
#         model = Patient 
#         fields = ['id','patient_id','first_name', 'last_name','dob','gender','mobile_number']

class PatientBodyDetailsSez(ModelSerializer):
    class Meta:
        model = PatientBodyDetails
        fields = '__all__'

class PrescriptionDetailSez(ModelSerializer):
    class Meta:
        model = PrescriptionBought
        fields = ['days','cost']

class PatientAppointmentSez(ModelSerializer):
    doctor = DoctorIdNameSez()
    body_details = PatientBodyDetailsSez()
    status = serializers.CharField(source = 'get_status_display')
    prescription_url = serializers.SerializerMethodField()
    prescription_details = serializers.SerializerMethodField()
    def get_prescription_url(self,obj):
        try :
            return obj.prescription.url
        except:
            return None
    def get_prescription_details(self,obj):
        try:
            return PrescriptionDetailSez(obj.prescription.prescription_details).data
        except:
            return None
    class Meta:
        model = Appointment
        fields = ['id','doctor','body_details','status','date','start_time','end_time','prescription_url','prescription_details']

class PatientReadSez(ModelSerializer):
    visit_count = serializers.SerializerMethodField()
    all_appointments = serializers.SerializerMethodField()
    def get_visit_count(self,obj:Patient):
        return obj.patient_appointments.count()
    def get_all_appointments(self,obj:Patient):
        user = self.context['user']
        all_appointments_till_date =  obj.patient_appointments.all().order_by('-date').order_by('start_time')
        if user.groups.first().name == 'doctor':
            all_appointments_till_date = all_appointments_till_date.filter(doctor = user.doctor)
        return PatientAppointmentSez(all_appointments_till_date, many=True).data
    class Meta:
        model = Patient
        fields = ['id','patient_id','first_name','last_name','dob','gender','mobile_number','email','visit_count','all_appointments','created_at']

class AppointmentCreateSez(ModelSerializer):
    class Meta:
        model = Appointment
        fields = ['doctor','patient','date','start_time','end_time']



class AttachPatientDetailsSez(ModelSerializer):
    body_details = PatientBodyDetailsSez()
    id = serializers.IntegerField()
    class Meta:
        model = Appointment
        fields = ['id', 'body_details']
    
    def create(self,validated_data):
        body_details = validated_data.pop('body_details')
        body_details_instance = PatientBodyDetails.objects.create(**body_details)
        appointment = Appointment.objects.get(id = validated_data.get('id'))
        appointment.body_details = body_details_instance
        appointment.save()
        return appointment

class AppointmentListSez(ModelSerializer):
    doctor = DoctorIdNameSez()
    patient = PatintIdNameSez()
    body_details = PatientBodyDetailsSez()
    status = serializers.CharField(source = 'get_status_display')
    prescription_url = serializers.SerializerMethodField()
    prescription_details = serializers.SerializerMethodField()
    invoice = serializers.SerializerMethodField()

    def get_prescription_url(self,obj):
        try :
            return obj.prescription.url
        except:
            return None
    def get_prescription_details(self,obj):
        try:
            return PrescriptionDetailSez(obj.prescription.prescription_details).data
        except:
            return None
    def get_invoice(self, obj):
        return PharmacyInvoice.objects.filter(appointment_id=obj.id).exists()
        
    class Meta:
        model = Appointment
        fields = '__all__'

class DoctorRecentSez(ModelSerializer):
    user = UserNameIdSez()
    specialization = SpecializationListSez()
    department = DepartmentListSez()
    class Meta:
        model = Doctor
        fields = ['id','user','specialization','department']

class RecentAppointmentSez(ModelSerializer):
    patient = PatintIdNameSez()
    doctor = DoctorRecentSez()
    body_details = PatientBodyDetailsSez()
    prescription_url = serializers.SerializerMethodField()
    prescription_details = serializers.SerializerMethodField()
    def get_prescription_url(self,obj):
        try :
            return obj.prescription.url
        except:
            return None
    def get_prescription_details(self,obj):
        try:
            return PrescriptionDetailSez(obj.prescription.prescription_details).data
        except:
            return None
    class Meta:
        model = Appointment
        fields = '__all__'

class MedicinesSez(serializers.Serializer):
    name = serializers.CharField()
    count = serializers.CharField()
    instructions = serializers.CharField()

class AttachPrescriptionSez(serializers.Serializer):
    observations = serializers.CharField()
    diagnosis = serializers.CharField()
    medicines = MedicinesSez(many = True)

class FramePrescriptionPdfContentSez(serializers.ModelSerializer):
    doctor_details = serializers.SerializerMethodField()
    patient_details = serializers.SerializerMethodField()
    body_details = serializers.SerializerMethodField()
    org_details = serializers.SerializerMethodField()

    def get_doctor_details(self, obj:Appointment):
        doctor = obj.doctor
        if doctor.user.last_name is None:
            name = doctor.user.first_name
        else:
            name = doctor.user.first_name + " " + doctor.user.last_name
        return {'name':name,'specialization':doctor.specialization.name, 'license':doctor.license,'department':doctor.department.name}
    
    def get_patient_details(self, obj:Appointment):
        patient = obj.patient
        if patient.last_name is None:
            name = patient.first_name
        else:
            name = patient.first_name + " " + patient.last_name
        current_date = datetime.now().date()
        patient_dob = patient.dob
        patient_age = relativedelta(current_date,patient_dob).years
        return {'name':name,'id':patient.patient_id,'gender':patient.gender,'mobile':patient.mobile_number,'email':patient.email,'age':patient_age}
    
    def get_body_details(self,obj:Appointment):
        return PatientBodyDetailsSez(obj.body_details).data
    
    def get_org_details(self,obj:Appointment):
        org = obj.doctor.organisation
        return OrgDetailsSez(org).data

    class Meta:
        model = Appointment
        fields = ['doctor_details','patient_details','body_details','org_details']

class BuyPrescriptionSez(ModelSerializer):
    class Meta:
        model = PrescriptionBought
        fields = ['cost','days']



class PrescriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Prescription
        fields = ['s3_url']


class DoctorAppointmentDateSez(serializers.ModelSerializer):
    appointment_date = serializers.DateField(source='date')
    doctor_name = serializers.SerializerMethodField()
    doctor_specialization = serializers.CharField(source='doctor.specialization.name')
    class Meta:
        model = Appointment
        fields = ['appointment_date', 'doctor_name', 'doctor_specialization']

    def get_doctor_name(self, obj):
        first_name = obj.doctor.user.first_name
        last_name = obj.doctor.user.last_name    
        if last_name:
            return f"{first_name} {last_name}"
        return first_name

class MedicalObservationSerializer(serializers.ModelSerializer):
    appointment_id = serializers.IntegerField(write_only=True)
    class Meta:
        model = MedicalObservation
        fields = ['appointment_id', 'clinical_observation', 'diagnosis']

    def validate(self, attrs):
        if MedicalObservation.objects.filter(appointment_id=attrs['appointment_id']).exists():
            raise serializers.ValidationError({"appointment_id": f"A medical observation already exists for appointment ID {attrs['appointment_id']}."})
        return attrs
    def create(self, validated_data):
        appointment = Appointment.objects.get(id=validated_data['appointment_id'])
        return MedicalObservation.objects.create(appointment=appointment, clinical_observation=validated_data.get('clinical_observation', ''), diagnosis=validated_data.get('diagnosis', ''))

class PrescribedMedicationSerializer(serializers.ModelSerializer):
    class Meta:
        model = PrescribedMedication
        fields = ['type', 'medicine', 'dose', 'when', 'frequency', 'duration', 'notes']

    def create(self, validated_data):
        medical_observation = self.context['medical_observation']
        return PrescribedMedication.objects.create(medical_observation=medical_observation, **validated_data)
