from typing import Any, Dict
from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from django.core.exceptions import ObjectDoesNotExist
from django.contrib.auth.hashers import check_password
from django.conf import settings
from django.core.mail import send_mail
import random
from .models import *
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer


class CampaignSerializer(serializers.ModelSerializer):
    class Meta:
        model = Campaign
        fields = '__all__'

        
class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs: Dict[str, Any]) -> Dict[str, str]:
        data =  super().validate(attrs)
        data['role'] = self.user.groups.first().name.lower()
        data['user_id'] = self.user.id
        data['email'] = self.user.email
        data['username'] = self.user.get_username()
        return data

class UserNameIdSerializer(ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username']



class AddressCreateSez(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class UserCreateSez(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)
    group = serializers.CharField(write_only=True)
    address = AddressCreateSez(write_only=True, required=False)

    class Meta:
        model = User
        fields = ['username', 'first_name', 'last_name', 'email', 'mobile_number', 'password', 'dob', 'group', 'address']

    def create(self, validated_data):
        password = validated_data.pop('password')
        group_name = validated_data.pop('group')
        address_data = validated_data.pop('address', None)
        if address_data is not None:
            address = Address.objects.create(**address_data)
            user = User.objects.create_user(**validated_data, address=address, password=password)
        else:
            user = User.objects.create_user(**validated_data, password=password)

        print("group from FE",group_name )
        group = settings.USER_TYPE_GROUP_MAP[group_name]
        print("group from settings",group )
        user.groups.add(group)
        return user
# class UserCreateSez(ModelSerializer):
#     password = serializers.CharField(write_only = True)
#     group = serializers.CharField(write_only = True)
#     address = AddressCreateSez(write_only = True, required = False)
#     class Meta:
#         model = User
#         fields = ['username','first_name','last_name','email','mobile_number', 'password','dob', 'group','address']
#     def create(self, validated_data):
#         password = validated_data.pop('password')
#         group_name = validated_data.pop('group')
#         address_data = validated_data.pop('address',None)
#         if address_data is not None:
#             address = Address.objects.create(**address_data)
#             user = User.objects.create_user(**validated_data, address = address ,password=password)
#         else:
#             user = User.objects.create_user(**validated_data, password=password)
#         group = settings.USER_TYPE_GROUP_MAP[group_name]
#         user.groups.add(group)
#         return user


class DaySerializer(ModelSerializer):
    class Meta:
        model = Day
        fields = ['day_of_week']

class DayValidationSerializer(serializers.Serializer):
    day_of_week = serializers.CharField()
    def validate_day_of_week(self, value):
        try:
            Day.objects.get(day_of_week = value)
        except ObjectDoesNotExist:
            raise serializers.ValidationError(['Day does not exist'])
        return value

class UserNameIdSez(ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','first_name','last_name']

class UserListSez(ModelSerializer):
    class Meta:
        model = User
        fields = ['id','username','first_name','last_name', 'mobile_number', 'email','dob','date_joined']

class AddressListSez(ModelSerializer):
    class Meta:
        model = Address
        fields = '__all__'

class OrgDetailsSez(ModelSerializer):
    address = AddressListSez()
    class Meta:
        model = Organisation
        fields = '__all__'

class UserUpdateSez(ModelSerializer):
    mobile_number = serializers.CharField()
    email = serializers.EmailField()
    class Meta:
        model = User
        fields = ['mobile_number','email']

class PasswordResetRequestSez(serializers.Serializer):
    email = serializers.EmailField()
    def validate_email(self, value):
        try:
            user = User.objects.get(email=value)
            self.context['user'] = user
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        return value

    def save(self, **kwargs):
        user = self.context['user']
        otp_code = f"{random.randint(100000, 999999)}"
        PasswordReset.objects.create(user=user, otp_code=otp_code)
        subject = "Medechopad Password Reset Request"
        user_name = f"{user.first_name} {user.last_name}".strip() if user.last_name else user.first_name
        additional_text = f"""Hi {user_name},

We received a request to reset your Medechopad account password. Please use the OTP below to proceed:

OTP: {otp_code}

This OTP expires in 10 minutes. If you didn't request this, please ignore this email.

Best,
The Medechopad Team"""
        try:
            send_mail(subject, additional_text, settings.EMAIL_HOST_USER, [user.email], fail_silently=False)
        except Exception as e:
            raise serializers.ValidationError(f"Failed to send the OTP email. Error: {e}")
        return {"email": user.email, "otp": otp_code}


class PasswordResetVerifySez(serializers.Serializer):
    email = serializers.EmailField()
    otp = serializers.CharField(max_length=6, required=False)
    new_password = serializers.CharField(max_length=128, required=False)

    def validate(self, data):
        email = data.get("email")
        otp = data.get("otp")
        new_password = data.get("new_password")
        try:
            user = User.objects.get(email=email)
            self.context["user"] = user
        except User.DoesNotExist:
            raise serializers.ValidationError("User with this email does not exist.")
        if otp:
            try:
                reset_entry = PasswordReset.objects.filter(user=user, otp_code=otp).latest('created_at')
                if not reset_entry.is_valid():
                    raise serializers.ValidationError("The OTP is invalid or has expired.")
                self.context["reset_entry"] = reset_entry
            except PasswordReset.DoesNotExist:
                raise serializers.ValidationError("Invalid OTP.")
        if new_password:
            if check_password(new_password, user.password):
                raise serializers.ValidationError("The new password must be different from the old password.")
        if not (otp or new_password):
            raise serializers.ValidationError("Either 'otp' or 'new_password' must be provided.")
        return data

    def update_password(self):
        user = self.context["user"]
        new_password = self.validated_data["new_password"]
        user.set_password(new_password)
        user.save()
    
    def mark_otp_as_used(self):
        reset_entry = self.context.get("reset_entry")
        if reset_entry:
            reset_entry.is_used = True
            reset_entry.save()
