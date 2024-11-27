from django.urls import path
from .views import *

urlpatterns = [
    path('specialization/',SpecializationCreateAPIView.as_view()),
    path('department/',DepartmentCreateAPIView.as_view()),
    path('create/',DoctorCreateAPIView.as_view()),
    path('read/<int:pk>',DoctorRead.as_view()),
    path('update/<int:pk>',DoctorUpdate.as_view()),
    path('availability/<int:doctor_id>',DoctorAvailabilityV2.as_view()),
    path('statement/',GetGptResponse.as_view()),
    path('getsocketurl/',GetSocketUrl.as_view())
]
