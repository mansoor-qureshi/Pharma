import json
import os
from .presigned_url import AWSTranscribePresignedURL
from typing import List, Dict
from django.shortcuts import render
from rest_framework import status
from rest_framework.response import Response
from rest_framework.generics import ListCreateAPIView, ListAPIView, RetrieveAPIView, UpdateAPIView
from rest_framework.views import APIView
from .models import *
from .serializers import *
from .utils import get_gpt_reponse, get_next_n_months, generate_slots_for_date_range
from datetime import datetime
import boto3
# Create your views here.

class SpecializationCreateAPIView(ListCreateAPIView):
    queryset = Specialization.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return SpecializationSez
        else:
            return SpecializationListSez

    def perform_create(self, serializer):
        obj = serializer.save(created_by = self.request.user)
        return obj

class DepartmentCreateAPIView(ListCreateAPIView):
    queryset = Department.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DepartmentSez
        else:
            return DepartmentListSez

    def perform_create(self, serializer):
        obj = serializer.save(created_by = self.request.user)
        return obj

class DoctorCreateAPIView(ListCreateAPIView):
    queryset = Doctor.objects.all()

    def get_serializer_class(self):
        if self.request.method == 'POST':
            return DoctorSez
        else:
            return DoctorListSez



class DoctorAvailability(ListAPIView):
    def get_queryset(self):
        return DayTimeAvailability.objects.filter(doctor_id = self.kwargs['doctor_id'])
    serializer_class = DoctorAvailabilitySez

    def list(self, request, *args, **kwargs):

        data = self.get_serializer(self.get_queryset(),many=True).data
        all_date_data = []
        for i in data:
            all_date_data.extend(i['availability'])
        sorted_data = sorted(all_date_data, key=lambda x:x['date'])
        return Response(sorted_data)

class DoctorRead(RetrieveAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorReadSez
    lookup_field = 'pk'

class DoctorUpdate(UpdateAPIView):
    queryset = Doctor.objects.all()
    serializer_class = DoctorUpdateSez
    lookup_field = 'pk'

class GetGptResponse(APIView):
    def post(self,request):
        statement = request.data.get('statement')
        prompt = f"give observations, diagnosis and medicines with names,count and when to take only in json string single line format for the following statement, statement : {statement}"
        gpt_op = get_gpt_reponse(prompt=prompt)
        content = gpt_op['choices'][0]['message']['content'].strip()
        content = json.loads(content)
        return Response(content,status=status.HTTP_200_OK)

class DoctorAvailabilityV2(APIView):

    def fetch_unavailability(self,doctor_id:int)-> List[Dict[str,str]]:
        unavaialbility = []
        for obj in UnavailableSlot.objects.filter(doctor_id = doctor_id).values("date",'start_time','end_time'):
            unavaialbility.append({'date':obj['date'].strftime("%Y-%m-%d"), 'start_time':obj['start_time'].strftime("%H:%M"), 'end_time':obj['end_time'].strftime("%H:%M")})
        return unavaialbility
    
    def get(self,request,doctor_id):
        avaialibity_qs = DayTimeAvailability.objects.filter(doctor_id = doctor_id)
        week_template = avaialibity_qs.values('day','start_time','end_time')
        month_date_ranges = get_next_n_months(n=3)
        total_slots = []
        for month_range in month_date_ranges:
            for day_template in week_template:
                total_slots.extend(generate_slots_for_date_range(start_date=month_range[0], end_date=month_range[1],day=day_template['day'],day_start_time=day_template['start_time'], day_end_time=day_template['end_time']))
        sorted_data = sorted(total_slots, key=lambda x:x['date'])
        unavailable_timings = self.fetch_unavailability(doctor_id=doctor_id)
        for obj in unavailable_timings:
            for date_slots in sorted_data:
                if obj['date'] == date_slots['date']:
                    for slot in date_slots['slots']:
                        if slot[0] == obj['start_time'] and slot[1] == obj['end_time']:
                            slot[2] = False
        first_obj = sorted_data[0]
        current_date = datetime.now().strftime("%Y-%m-%d")
        if first_obj['date']==current_date:
            day_slots = first_obj['slots'].copy()
            current_datetime = datetime.now()
            for i in range(len(day_slots)):
                slot_start_time_str = current_date+day_slots[i][0]
                slot_start_time = datetime.strptime(slot_start_time_str,"%Y-%m-%d%H:%M")
                if slot_start_time<current_datetime:
                    print("curr  :", current_datetime)
                    print("slot :", slot_start_time)
                    print("="*50)
                    first_obj['slots'].remove(day_slots[i])
        if not first_obj['slots']:
            sorted_data.pop(0)
        return Response(sorted_data,status=status.HTTP_200_OK)


class GetSocketUrl(APIView):
    def get(self,request):
        sts_client = boto3.client('sts')
        response = sts_client.get_session_token(DurationSeconds=3600)
        credentials = response['Credentials']
        access_key = credentials['AccessKeyId']
        secret_key = credentials['SecretAccessKey']
        session_token = credentials['SessionToken']
        region = os.getenv("AWS_DEFAULT_REGION","us-east-1")
        region = os.getenv("AWS_DEFAULT_REGION","us-east-1")
        transcribe_url_generator = AWSTranscribePresignedURL(access_key, secret_key, session_token, region)
        language_code = "en-US"
        media_encoding = "pcm"
        sample_rate = 44100 #8000
        number_of_channels = 2
        specialty="PRIMARYCARE"
        type="DICTATION"
        channel_identification = True
        bytes_per_sample = 2 # 16 bit audio
        chunk_size = sample_rate * 2 * number_of_channels / 10 # roughly 100ms of audio data	
        request_url = transcribe_url_generator.get_request_url(sample_rate,specialty,type,language_code,media_encoding,number_of_channels=number_of_channels,enable_channel_identification=channel_identification)
        data = dict()
        data["websocket_url"]= str(request_url)
        return Response(data,status=status.HTTP_200_OK)
