from botocore.exceptions import ClientError
from django.conf import settings
from django.core.files.base import ContentFile
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from .models import Specialization, Department, Doctor, DayTimeAvailability
from core.models import Day, Organisation
from core.serializers import UserCreateSez, AddressCreateSez, DayValidationSerializer, DaySerializer, UserNameIdSez, UserListSez, AddressListSez, UserNameIdSerializer, UserUpdateSez
from .utils import get_upcoming_days, get_half_hour_slots, upload_to_s3
from PIL import Image
import boto3
from django.conf import settings

class SpecializationSez(ModelSerializer):
    class Meta:
        model = Specialization
        fields = ['name']

class SpecializationListSez(ModelSerializer):
    created_by = UserNameIdSerializer()
    class Meta:
        model = Specialization
        fields = '__all__'

class DepartmentSez(ModelSerializer):
    class Meta:
        model = Department
        fields = ['name']

class DepartmentListSez(ModelSerializer):
    created_by = UserNameIdSerializer()
    class Meta:
        model = Department
        fields = '__all__'

class DaySlotSez(ModelSerializer):
    day = DayValidationSerializer()
    class Meta:
        model = DayTimeAvailability
        fields = ['day','start_time','end_time']


class DoctorListSez(ModelSerializer):
    user = UserListSez()
    address = AddressCreateSez()
    department = DepartmentListSez()
    specialization = SpecializationListSez()
    class Meta:
        model = Doctor
        fields = '__all__'

class DoctorSez(ModelSerializer):
    daytimeavailability = DaySlotSez(many=True,write_only=True)
    user = UserCreateSez()
    address = AddressCreateSez()
    signature = serializers.CharField(required = False)
    class Meta:
        model = Doctor
        fields = ['id','user','specialization','department','experience','license','daytimeavailability', 'address','op_fee','signature']
    
    def create(self,validated_data):
        user_data = validated_data.pop('user')
        address_data = validated_data.pop('address')
        daytimeavailability = validated_data.pop('daytimeavailability')
        signature_data = validated_data.pop('signature',None)

        print("MAIN",daytimeavailability)

        user_sez = UserCreateSez(data = user_data)
        if user_sez.is_valid():
            user = user_sez.save()
            user.groups.add(settings.USER_TYPE_GROUP_MAP['doctor'])
        
        address_sez = AddressCreateSez(data = address_data)
        if address_sez.is_valid():
            address = address_sez.save()
        

        doctor = Doctor.objects.create(
            user = user,
            address = address,
            **validated_data,
            organisation = Organisation.objects.first()
        )
        self.create_availability_slots(day_time_availability=daytimeavailability,doctor=doctor)
        if signature_data:
            s3_url = self.save_signature(username=doctor.user.username,base64_img_data=signature_data)
            doctor.signature = s3_url
            doctor.save()

        return doctor

    def save_signature(self,username:str, base64_img_data:str):
        try:
            presigned_url = upload_to_s3(data_storage_type='signature',base64_image_data=base64_img_data,entity_name=username,user_dir='doctors')
            return presigned_url
        except ClientError as error:
            raise serializers.ValidationError(f"S3 error:{error}")



    def create_availability_slots(self,day_time_availability,doctor):
        for day_wise_data in day_time_availability:
            day = day_wise_data['day']['day_of_week']
            start_time = day_wise_data.get('start_time')
            end_time = day_wise_data.get('end_time')
            time_slot = DayTimeAvailability(
                day = Day.objects.get(day_of_week = day),
                start_time = start_time,
                end_time = end_time,
                doctor = doctor)
            time_slot.save()

class DoctorAvailabilitySez(ModelSerializer):
    availability = serializers.SerializerMethodField()
    # day = DaySerializer()
    def get_availability(self,obj:DayTimeAvailability):
        upcoming_dates = get_upcoming_days(obj.day.day_of_week)
        # slot_times = get_slot_times(obj.start_time,obj.end_time)
        slot_times = get_half_hour_slots(obj.start_time,obj.end_time)

        possible_slots = []
        for date in upcoming_dates:
            obj = {}
            obj['date'] = date
            obj['slots'] = []
            for slot in slot_times:
                obj['slots'].append((slot[0],slot[1]))
            possible_slots.append(obj)
        return possible_slots
    class Meta:
        model = DayTimeAvailability
        # fields = ['doctor','day','start_time','end_time','availability']
        fields = ['availability']

    def to_representation(self, instance):
        data = super().to_representation(instance)
        return data
    
class DoctorIdNameSez(ModelSerializer):
    user = UserNameIdSez()
    class Meta:
        model = Doctor
        fields = ['id','user']

class DocAvailability(ModelSerializer):
    day = DaySerializer()
    class Meta:
        model = DayTimeAvailability
        fields = ['day','start_time','end_time']

class DoctorReadSez(ModelSerializer):
    user = UserListSez()
    address = AddressListSez()
    specialization = SpecializationListSez()
    department = DepartmentListSez()
    op_count = serializers.SerializerMethodField()
    availability = serializers.SerializerMethodField()
    signature = serializers.SerializerMethodField()

    def get_op_count(self,obj:Doctor):
         return obj.doctor_appointments.count()
    
    def get_availability(self,obj:Doctor):
        return DocAvailability(obj.assigned_timeslots.all(),many=True).data
    
    def get_signature(self, obj):
        bucket_name = 'medimind-app'
        object_name = f'doctors/{obj.user.username}/signature.png'
        s3_client = boto3.client('s3', 
                             aws_access_key_id=settings.AWS_ACCESS_KEY_ID, 
                             aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
                             region_name = settings.AWS_S3_REGION_NAME)
        
        response = s3_client.generate_presigned_url(
        'get_object',
        Params = {'Bucket':bucket_name, 'Key':object_name, 'ResponseContentDisposition': 'inline'},
        ExpiresIn = 3600
    )
        return response
        
    class Meta:
        model = Doctor
        fields = ['id','user','address','specialization','department','experience','license','op_count','availability','op_fee','signature']

class DoctorUpdateSez(ModelSerializer):
    user = UserUpdateSez(required = False)
    address = AddressCreateSez(required = False)
    daytimeavailability = DaySlotSez(many = True, write_only = True, required = False)
    class Meta:
        model = Doctor
        fields = ['op_fee','user','address','specialization','daytimeavailability']
    
    def update(self, instance:Doctor, validated_data):
        user_data = validated_data.pop('user',None)
        address_data = validated_data.pop('address',None)
        daytimeavailability = validated_data.pop('daytimeavailability', None)

        if user_data:
            user_instance = instance.user
            user_serializer = UserUpdateSez(user_instance, data = user_data, partial = True)
            if user_serializer.is_valid():
                user_serializer.save()
        if address_data:
            address_instance = instance.address
            address_serializer = AddressCreateSez(address_instance, data = address_data, partial = True)
            if address_serializer.is_valid():
                address_serializer.save()
        if daytimeavailability:
            self.remove_old_slots(doctor=instance)
            self.create_availability_slots(day_time_availability=daytimeavailability,doctor=instance)

        instance.op_fee = validated_data.get('op_fee',instance.op_fee)
        instance.specialization = validated_data.get('specialization',instance.specialization)
        instance.save()
        return instance

    def remove_old_slots(self,doctor):
        DayTimeAvailability.objects.filter(doctor=doctor).delete()

    def create_availability_slots(self,day_time_availability,doctor):
        for day_wise_data in day_time_availability:
            day = day_wise_data['day']['day_of_week']
            start_time = day_wise_data.get('start_time')
            end_time = day_wise_data.get('end_time')
            time_slot = DayTimeAvailability(
                day = Day.objects.get(day_of_week = day),
                start_time = start_time,
                end_time = end_time,
                doctor = doctor)
            time_slot.save()
