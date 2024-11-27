from django.urls import path
from .views import * 

urlpatterns = [
     path('',PatientCreate.as_view()),
     path('read/<int:pk>',PatientRead.as_view()),
     path('appointment/',ScheduleAppointment.as_view()),
     path('appointment/list',ListAppointments.as_view()),
     path('appointment/bodydetails/',AttachPatientDetails.as_view()),
     path('dashboard/doctorop',DashBoard.as_view()),
     path('dashboard/op',PatientAndOpDashboard.as_view()),
     path('appointment/recent',RecentAppointments.as_view()),
     path('appointment/prescription/<int:pk>',AttachPrescription.as_view()),
     path('search/',PatientSearch.as_view()),
     path('doctor/count',DoctorPatientCount.as_view()),
     path('prescription/buy/<int:pk>',BuyPrescription.as_view()),
     path('prescription/s3-url/<int:pk>/', GetPrescriptionS3URL.as_view(), name='get_prescription_s3_url'),
     path('check-pincode/<str:pincode>/', CheckPincodeView.as_view(), name='check_pincode'),
     path('by-area/', PatientByAreaList.as_view(), name='patient-by-area-list'),
     path('pincodes/', pincodes_list, name='pincodes-list'),
     path('update-prescription-bought/', UpdatePrescriptionBoughtView.as_view(), name='update-prescription-bought'),

     path('appointmentsdates/<int:patient_id>/', PatientAppointmentListView.as_view(), name='patient-appointments'),
     path('generate-clinicaldata/', GenerateClinicalData.as_view(), name='generate-clinical-data'),
     path('optionsdropdown/<str:option>/', MedicationDropdownOptions.as_view(), name='modeicines Option dropdown'),
     path('generate-prescription/<int:pk>/', GeneratePrescription.as_view(), name='generate-prescription'),


     ]
