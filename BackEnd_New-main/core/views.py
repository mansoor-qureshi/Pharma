from django.shortcuts import render
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.generics import CreateAPIView
from rest_framework.permissions import IsAuthenticated
from rest_framework import serializers, status, generics
from rest_framework.response import Response
from rest_framework.views import APIView
from .serializers import *
from django.conf import settings
from .models import User
from django.contrib.auth.models import Group
 
# Create your views here.
class CampaignListCreateView(generics.ListCreateAPIView):
    queryset = Campaign.objects.all()
    serializer_class = CampaignSerializer

class CustomerTokenObtainPair(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    token_obtain_pair = TokenObtainPairView.as_view()

# class UserCreate(CreateAPIView):
#     permission_classes = (IsAuthenticated,)
#     queryset = User.objects.all()
#     serializer_class = UserCreateSez

class UserCreate(APIView):
    # permission_classes = (IsAuthenticated,)
    serializer_class = UserCreateSez

    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def get(self, request, *args, **kwargs):
        doctor_group = Group.objects.get(name='doctor')
        users = User.objects.exclude(groups=doctor_group)
        serializer = self.serializer_class(users, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class PasswordResetRequest(APIView):
    def post(self, request):
        serializer = PasswordResetRequestSez(data=request.data)
        if serializer.is_valid():
            data = serializer.save()
            return Response({"message": "An OTP has been sent to your email for password reset.","email": data["email"]}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PasswordResetVerify(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PasswordResetVerifySez(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = serializer.context["user"]
        # OTP Verification
        if "otp" in request.data:
            serializer.mark_otp_as_used()
            return Response({"message": "OTP verified successfully.", "email": user.email}, status=status.HTTP_200_OK)
        # Password Reset
        if "new_password" in request.data:
            serializer.update_password()
            return Response({"message": "Password has been reset successfully.", "email": user.email}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid request."}, status=status.HTTP_400_BAD_REQUEST)

