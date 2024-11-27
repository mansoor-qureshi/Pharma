from datetime import datetime, timedelta
from django.shortcuts import render
from django.db import models
from django.utils import timezone
from django.template.loader import render_to_string
# from weasyprint import HTML
from rest_framework.generics import ListCreateAPIView, CreateAPIView, ListAPIView, RetrieveAPIView
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status, filters
from .models import Patient, Appointment, Prescription, PrescriptionBought
from .serializers import PatientCreateSez, PrescriptionSerializer, AppointmentCreateSez, AttachPatientDetailsSez, AppointmentListSez, PatientReadSez, RecentAppointmentSez, PatientListSez, AttachPrescriptionSez, FramePrescriptionPdfContentSez, BuyPrescriptionSez, PrescriptionBoughtSerializer, DoctorAppointmentDateSez, MedicalObservationSerializer, PrescribedMedicationSerializer
from .pagination import CustomPagination
from doctor.models import UnavailableSlot, Doctor
import pdfkit
from io import BytesIO
import boto3
from django.conf import settings
from .utils import upload_prescription_to_s3
from django.core.files.base import ContentFile
import os
from twilio.rest import Client
import indiapins
from django.db.models import Q
import json
from django.http import JsonResponse
from doctor.utils import get_gpt_reponse
from src import settings


class UpdatePrescriptionBoughtView(APIView):
    def post(self, request, *args, **kwargs):
        serializer = PrescriptionBoughtSerializer(data=request.data)
        if serializer.is_valid():
            prescription_bought = serializer.save()
            return Response({"message": "PrescriptionBought record updated successfully."}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

def pincodes_list(request):
    with open('/usr/share/nginx/html/django/patient/pincodes.json', 'r') as file:
        pincodes_data = json.load(file)
    return JsonResponse(pincodes_data)

# class PatientByAreaList(ListAPIView):
#     serializer_class = PatientCreateSez

#     def get_queryset(self):
#         areas = self.request.data.get('areas', [])
#         if not areas:
#             return Patient.objects.none()

#         q_objects = Q()
#         for area in areas:
#             q_objects |= Q(address__area__icontains=area)

#         return Patient.objects.filter(q_objects).distinct()

class PatientByAreaList(APIView):
    serializer_class = PatientCreateSez

    def post(self, request, *args, **kwargs):
        areas = request.data.get('areas', [])
        if not areas:
            return Response({"detail": "No areas provided."}, status=status.HTTP_400_BAD_REQUEST)

        q_objects = Q()
        for area in areas:
            q_objects |= Q(address__area__icontains=area)

        patients = Patient.objects.filter(q_objects).distinct()
        serializer = self.serializer_class(patients, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class CheckPincodeView(APIView):
    def get(self, request, pincode):
        if not indiapins.isvalid(pincode):
            return Response({"error": "Invalid Pincode"}, status=status.HTTP_400_BAD_REQUEST)
        
        areas = indiapins.matching(pincode)
        if not areas:
            return Response({"error": "No areas found for the given pincode"}, status=status.HTTP_404_NOT_FOUND)
        
        area_names = [area['Name'] for area in areas]
        return Response({"areas": area_names}, status=status.HTTP_200_OK)
    
    

class PatientCreate(ListCreateAPIView):
    def get_serializer_class(self):
        if self.request.method == "POST":
            return PatientCreateSez
        else:
            return PatientListSez
    queryset = Patient.objects.all()
    serializer_class = PatientCreateSez

class PatientRead(RetrieveAPIView):
    permission_classes = (IsAuthenticated,)
    queryset = Patient.objects.all()
    serializer_class = PatientReadSez
    lookup_field = 'pk'

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context['user'] = self.request.user
        return context
    
class ScheduleAppointment(CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AppointmentCreateSez

    def perform_create(self, serializer):
        appointment = serializer.save()
        UnavailableSlot.objects.create(
            doctor = appointment.doctor,
            date = appointment.date,
            start_time = appointment.start_time,
            end_time = appointment.end_time,

        )
        return appointment

class ListAppointments(ListAPIView):
    permission_classes = (IsAuthenticated,)
    def get_queryset(self):
        user_group = self.request.user.groups.first().name
        if user_group in  ['admin','pharmacist']:
            return  Appointment.objects.filter(
                date__range = [self.request.query_params.get('start_date',None), self.request.query_params.get('end_date',None)])
        elif user_group == 'doctor':
            return Appointment.objects.filter(
                doctor = self.request.user.doctor,
                date__range = [self.request.query_params.get('start_date',None), self.request.query_params.get('end_date',None)]
                )

    serializer_class = AppointmentListSez

class AttachPatientDetails(CreateAPIView):
    queryset = Appointment.objects.all()
    serializer_class = AttachPatientDetailsSez

class DashBoard(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self,request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')
        if self.request.user.groups.first().name == 'admin':
            doctor_wise_op = request.query_params.get('doctor_wise_op')
            department_wise_op = request.query_params.get('department_wise_op')
            if doctor_wise_op:
                doctor_appointments = Appointment.objects.filter(
                    date__range = [start_date, end_date]).values(
                        'doctor__id','doctor__user__username').annotate(
                            appointment_count = models.Count('doctor__id')
                        )
                doctor_op_counts = {item['doctor__user__username']:item['appointment_count'] for item in doctor_appointments}
                response_data = {'op_count':doctor_op_counts}
            
            if department_wise_op:
                department_appointments = Appointment.objects.filter(
                    date__range = [start_date, end_date]).values(
                        'doctor__specialization__id','doctor__specialization__name').annotate(
                            appointment_count = models.Count('doctor__specialization__id')
                        )
                dept_op_counts = {item['doctor__specialization__name']:item['appointment_count'] for item in department_appointments}
                response_data = {'op_count':dept_op_counts}

        elif self.request.user.groups.first().name == 'doctor':
            doctor_appointments = Appointment.objects.filter(
                date__range = [start_date, end_date],
                doctor = self.request.user.doctor).values(
                    'status').annotate(
                        count = models.Count('status')
                    )
            response_data = {'op_count':doctor_appointments}
        return Response(response_data,status=status.HTTP_200_OK)

class PatientAndOpDashboard(APIView):
    permission_classes = (IsAuthenticated,)    
    def get_op_patient_count_on_date(self,date,doctor = None):
        date_appointments = Appointment.objects.filter(date = date)
        if doctor is not None:
            date_appointments = date_appointments.filter(doctor = doctor)
        op_count = date_appointments.count()
        patient_count = Patient.objects.filter(
            created_at = date).count()
        pres_bought = date_appointments.filter(prescription_bought = True).count()
        pres_ignored = date_appointments.filter(prescription_bought = False).count()
        return {'date':date,'op_count':op_count,'patient_count':patient_count,'bought':pres_bought, 'ignored':pres_ignored}
    
    def get_next_n_dates(self,date,n=5):
        next_n_dates = []
        for i in range(1,n):
            next_n_dates.append(date + timedelta(days=i))
        return next_n_dates
    
    def get(self,request):
        if self.request.user.groups.first().name == 'admin':
            doctor = None
        elif self.request.user.groups.first().name == 'doctor':
            doctor = self.request.user.doctor
        today_date = timezone.now().date()
        yesterday_date = today_date - timedelta(days = 1)
        next_n_dates = self.get_next_n_dates(date=today_date)
        response_data = {
            "today"         : self.get_op_patient_count_on_date(today_date,doctor=doctor),
            "yesterday"     : self.get_op_patient_count_on_date(yesterday_date,doctor=doctor),
            "upcoming_ops"  : [self.get_op_patient_count_on_date(i,doctor=doctor) for i in next_n_dates]

        }
        return Response(response_data,status=status.HTTP_200_OK)

class PatientSearch(ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientListSez
    filter_backends = [filters.SearchFilter]
    search_fields = ['mobile_number', 'first_name', 'last_name']


class RecentAppointments(ListAPIView):
    """
    Filtering based on Date range params and ordering based on slot time
    """
    permission_classes = (IsAuthenticated,)
    serializer_class = RecentAppointmentSez
    pagination_class = CustomPagination

    def get_queryset(self):
        start_date = self.request.query_params.get('start_date')
        end_date = self.request.query_params.get('end_date')
        user = self.request.user
        if user.groups.first().name == 'admin':
            queryset = Appointment.objects.filter(date__range = [start_date, end_date]).order_by('date','start_time')
        elif user.groups.first().name == 'doctor':
            queryset = Appointment.objects.filter(doctor__user = user).filter(date__range = [start_date, end_date]).order_by('date','start_time')
        specialization_id = self.request.query_params.get('specialization_id',None)
        department_id = self.request.query_params.get('department_id',None)
        doctor_id = self.request.query_params.get('doctor_id',None)
        prescription_bought = self.request.query_params.get('prescription_bought',None)
       
        if specialization_id:
            queryset = queryset.filter(doctor__specialization__id = specialization_id)
        if department_id:
            queryset = queryset.filter(doctor__department__id = department_id)
        if doctor_id:
            queryset = queryset.filter(doctor_id = doctor_id)
        if prescription_bought:
            queryset = queryset.filter(prescription_bought = prescription_bought)
        return queryset

class AttachPrescription(APIView):
    def send_watsapp_msg(self,appointment,phone,pat_name,doc_name,url):
        # Find your Account SID and Auth Token at twilio.com/console
        # and set the environment variables. See http://twil.io/secure
        

        account_sid = settings.T_SID
        auth_token = settings.T_TOKEN
        client = Client(account_sid, auth_token)

        client.messages.create(
        from_='whatsapp:+14155238886',
        body=f'Hello {pat_name}, your appointment with DR.{doc_name} is completed successfully. Please check the prescription below.',
        to=f'whatsapp:{phone}'
        )
        client.messages.create(
         media_url=[url],
         from_='whatsapp:+14155238886',
         to=f'whatsapp:{phone}'
     )
    def put(self, request, pk, format=None):
        try:
            appointment = Appointment.objects.get(id=pk)
        except Appointment.DoesNotExist:
            return Response({"error":"Appointment Not Found"}, status = status.HTTP_404_NOT_FOUND)
        

        serializer = AttachPrescriptionSez(data = request.data)
        if serializer.is_valid():
            context ={}
            context['prescription_summary'] = serializer.validated_data
            context['pat_doc'] = FramePrescriptionPdfContentSez(appointment).data
            print("context : ", context)
            html_content = render_to_string('patient/prescription.html',context)
            pdf_data = pdfkit.from_string(html_content, options={"enable-local-file-access": ""})
            pdf_obj=BytesIO(pdf_data)
            pdf_obj.seek(0)

            #prescription_url = upload_prescription_to_s3(patient_id=appointment.patient.patient_id, appointment_id=appointment.id, pdf_obj=pdf_obj)
            prescription = Prescription(appointment=appointment)
            prescription.url=f'patient/{appointment.patient.patient_id}/prescription_{appointment.id}.pdf'
            prescription.s3_url.save(f'prescription_{appointment.id}.pdf', ContentFile(pdf_obj.read()))

            # with open(file_path,"w") as html_file:
            #     html_file.write(html_content)
            # html = HTML(string=html_content)
            # html.write_pdf(file_path)
            appointment.status = Appointment.Status.COMPLETED
            appointment.save()
            print(appointment.id,context['pat_doc']['patient_details']['mobile'],prescription.s3_url.url)
            self.send_watsapp_msg(appointment.id,context['pat_doc']['patient_details']['mobile'],context['pat_doc']['patient_details']['name'],
                             context['pat_doc']['doctor_details']['name'],prescription.s3_url.url)
            return Response(context, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class DoctorPatientCount(APIView):
    permission_classes = (IsAuthenticated,)
    def get(self,request):
        doctor_count = Doctor.objects.count()
        male_patient_count = Patient.objects.filter(gender = Patient.Gender.MALE).count()
        female_patient_count = Patient.objects.filter(gender = Patient.Gender.FEMALE).count()
        output = {'doctor_count':doctor_count,'patient_count':{'male':male_patient_count,'female':female_patient_count}}
        return Response(output,status=status.HTTP_200_OK)

class BuyPrescription(APIView):
    def put(self, request, pk, format=None):
        try:
            appointment = Appointment.objects.get(id=pk)
        except Appointment.DoesNotExist:
            return Response({"error":"Appointment Not Found"}, status = status.HTTP_404_NOT_FOUND)
        
        serializer = BuyPrescriptionSez(data = request.data)
        if serializer.is_valid():
            try:
                app_prescription = appointment.prescription
            except Prescription.DoesNotExist:
                return Response({"error":"Prescription Not Generated For this appointment"},status=status.HTTP_404_NOT_FOUND)
            
            PrescriptionBought.objects.create(prescription = app_prescription, **serializer.validated_data)
            appointment.prescription_bought = True
            appointment.save()

            return Response({"Prescription Bought"}, status=status.HTTP_200_OK)
        else:
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class GetPrescriptionS3URL(APIView):
    def get(self, request, pk, format=None):
        try:
            appointment = Appointment.objects.get(id=pk)
            prescription = Prescription.objects.get(appointment=appointment)
            serializer = PrescriptionSerializer(prescription)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment Not Found"}, status=status.HTTP_404_NOT_FOUND)
        except Prescription.DoesNotExist:
            return Response({"error": "Prescription Not Found"}, status=status.HTTP_404_NOT_FOUND)
    
class PatientAppointmentListView(ListAPIView):
    serializer_class = DoctorAppointmentDateSez
    def list(self, request, *args, **kwargs):
        patient_id = self.kwargs['patient_id']
        try:
            Patient.objects.get(pk=patient_id)
        except Patient.DoesNotExist:
            return Response({"error": "Patient not found."}, status=status.HTTP_404_NOT_FOUND)
        
        queryset = Appointment.objects.filter(patient__id=patient_id)
        serializer = self.get_serializer(queryset, many=True)
        response_data = {"patient_id": patient_id,"appointment_data": serializer.data}
        return Response(response_data, status=status.HTTP_200_OK)

class GenerateClinicalData(APIView):
    def post(self, request):
        prescriptions = request.data
        if not isinstance(prescriptions, list):
            return Response({"error": "Invalid input format. Expected a list of prescription details."},status=status.HTTP_400_BAD_REQUEST)

        prescription_details = "\n".join(
            f"Medicine Type: {prescription.get('type')}, Medicine: {prescription.get('medicine')}, "
            f"Dose: {prescription.get('dose')}, When: {prescription.get('when')}, "
                f"Frequency: {prescription.get('frequency')}, Duration: {prescription.get('duration')}, notes/instructions: {prescription.get('notes')}"
            for prescription in prescriptions
        )
        prompt = (
            f"Provide an overall clinical observation that mentions the medicines prescribed by the doctor and include only the disease names as a single line string in the diagnosis based on the following prescription:\n"
            f"{prescription_details}.\n"
            f"Provide the response in JSON format with keys 'clinical_observation' and 'diagnosis'."
        )
        try:
            gpt_response = get_gpt_reponse(prompt=prompt)
            content = gpt_response['choices'][0]['message']['content'].strip()
            content_dict = json.loads(content)
            if 'clinical_observation' not in content_dict or 'diagnosis' not in content_dict:
                return Response({"error": "GPT response did not include expected keys: 'clinical_observation' and 'diagnosis'."},status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            return Response(content_dict, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": f"An error occurred while processing GPT response: {str(e)}"},status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class MedicationDropdownOptions(APIView):
    def get(self, request, option):
        if option == "dose":
            result = ["1-0-0", "0-0-1", "1-0-1", "0-1-0", "1-1-0", "1-1-1", "0-0-0-1"]
        elif option == "when":
            result = ["After Food", "Before Food", "Before Breakfast", "After Breakfast", 
                      "Before Lunch", "After Lunch", "Before Dinner", "After Dinner", 
                      "Empty Stomach", "Bed Time"]
        elif option == "frequency":
            result = ["daily", "alternate day", "weekly", "fortnight", "monthly", 
                      "stat", "sos", "weekly twice", "weekly thrice"]
        elif option == "duration":
            result = ["1 day", "1 week", "1 month", "1 year"]
        else:
            return Response({"message": "Invalid option."}, status=status.HTTP_400_BAD_REQUEST)
        return Response(result, status=status.HTTP_200_OK)
    
class GeneratePrescription(APIView):
    def put(self, request, pk, format=None):
        try:
            appointment = Appointment.objects.get(id=pk)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment Not Found"}, status=status.HTTP_404_NOT_FOUND)
        prescription_data = request.data.get('prescription_items', [])
        clinical_observation = request.data.get('clinical_observation', '')
        diagnosis = request.data.get('diagnosis', '')

        observation_data = {'appointment_id': pk, 'clinical_observation': clinical_observation, 'diagnosis': diagnosis}
        observation_serializer = MedicalObservationSerializer(data=observation_data)
        if not observation_serializer.is_valid():
            return Response(observation_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        medical_observation = observation_serializer.save()

        medication_serializer = PrescribedMedicationSerializer(data=prescription_data, many=True, context={'medical_observation': medical_observation})
        if not medication_serializer.is_valid():
            return Response(medication_serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        medication_serializer.save()

        pdf_content_serializer = FramePrescriptionPdfContentSez(appointment)
        pdf_data = pdf_content_serializer.data
        pdf_data['prescription_summary'] = prescription_data
        pdf_data['clinical_observation'] = clinical_observation
        pdf_data['diagnosis'] = diagnosis
        logo_path = os.path.join(settings.BASE_DIR, "patient", "templates", "patient", "static", "medi_mind.jpeg")
        pdf_data['logo_path'] = logo_path

        html_content = render_to_string('patient/prescriptionv1.html', pdf_data)
        pdf_binary_data = pdfkit.from_string(html_content, options={"enable-local-file-access": True})
        pdf_file = BytesIO(pdf_binary_data)
        pdf_file.seek(0)
        prescription = Prescription.objects.create(appointment=appointment, url=f'patient/{appointment.patient.patient_id}/prescription_{appointment.id}.pdf')
        prescription.s3_url.save(f'prescription_{appointment.id}.pdf', ContentFile(pdf_file.read()))
        appointment.status = Appointment.Status.COMPLETED
        appointment.save()
        return Response({"message": "Prescription generated successfully","prescription_url": prescription.s3_url.url}, status=status.HTTP_200_OK)
