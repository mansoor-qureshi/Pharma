from django.urls import path
from .views import *

urlpatterns = [
    path('category/', CategoryCreateAPIView.as_view(), name='category-list-create'),  # GET and POST and SEARCH
    path('category/update/<int:pk>/', CategoryAPIView.as_view(), name='category-update'),  # PUT
    path('category/delete/<int:pk>/', CategoryAPIView.as_view(), name='category-delete'),  # DELETE

    path('medicines/create/', MedicineConfiguration.as_view(), name='medicine-configuration'), # POST
    path('medicine/<int:id>/', MedicineConfiguration.as_view(), name='medicine_configuration'), # PUT and DELETE
    path('medicines/', MedicinesAPIView.as_view(), name='medicines-list'), # SEARCH (GET) and ALL MEDICINE (GET) and MEDICINE BY CATEGORY (GET)
    path('categorylist/', CategoriesListAPIView.as_view(), name='medicine-list'), # MEDICINE CATERGORIES LIST (GET)
    path('update_stock/<int:id>/', UpdateMedicineStockView.as_view(), name='update_medicine_stock'), # UPDATE STOCK (PUT)

    path('process_prescription/', ProcessPrescription.as_view(), name='process-prescription'),
    path('payment/', PharmacyPayment.as_view(), name='Medicines payments'),
    path('pharmacyinvoice/s3-url/<int:appointment_id>/', PharmacyInvoiceS3URL.as_view(), name='get pharmacy invoice PDF url'),
    path('customer/', CustomerConfiguration.as_view(), name='customer-create-list-search'), # Customer (GET and POST and SEARCH)

    # path('customer_purchase/<int:customer_id>/', CustomerPurchaseDetailSerializer.as_view(), name='customer-purchase-create'),
    path('customer_purchase/<int:id>/', CustomerPurchasesView.as_view(), name='customer-purchases-by-customer'),
    # path('customer_purchase/<int:pk>/', CustomerPurchaseDetailView.as_view(), name='customer-purchase-detail'),


]