from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.generics import ListCreateAPIView, ListAPIView 
from django.db import transaction 
from rest_framework.permissions import IsAuthenticated
from .models import Category, Medicine, Customer, CustomerPurchase, PharmacyInvoice, MedicineStock
from .serializers import CategorySez, CategoryListSez, MedicineSez, MedicineListSez, CategoryIdNameSez, MedicineStockSez, CustomerSez, CustomerListSez, CustomerDetailSerializer, CustomerPurchaseDetailSerializer, PaymentCreateSerializer, PharmacyInvoiceSez
from .pagination import CustomPagination
from patient.models import Appointment
from patient.serializers import PatintIdNameSez
from core.serializers import OrgDetailsSez
from rest_framework.exceptions import ValidationError
from io import BytesIO
import pdfkit
from datetime import datetime
from django.template.loader import render_to_string
from django.core.files.base import ContentFile

class CategoryCreateAPIView(ListCreateAPIView):
    queryset = Category.objects.all()
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CategorySez
        return CategoryListSez

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        search_query = self.request.query_params.get('search', None)
        if search_query:
            queryset = queryset.filter(name__icontains=search_query)
        return queryset

class CategoryAPIView(APIView):
    permission_classes = [IsAuthenticated]
    def get_object(self, pk):
        try:
            return Category.objects.get(pk=pk)
        except Category.DoesNotExist:
            return None

    def put(self, request, pk, format=None):
        category = self.get_object(pk)
        if category is None:
            return Response({"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySez(instance=category, data=request.data)
        if serializer.is_valid():
            obj = serializer.save(updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, pk, format=None):
        category = self.get_object(pk)
        if category is None:
            return Response({"detail": "Category not found."}, status=status.HTTP_404_NOT_FOUND)
        category.delete()
        return Response({"detail": "Category deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class MedicineConfiguration(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        serializer = MedicineSez(data=request.data, context={'request': request})
        if serializer.is_valid():
            medicine = serializer.save()
            return Response(MedicineSez(medicine).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, id):
        try:
            medicine = Medicine.objects.get(id=id)
        except Medicine.DoesNotExist:
            return Response({"detail": "Medicine not found."}, status=status.HTTP_404_NOT_FOUND)
        
        serializer = MedicineSez(medicine, data=request.data, partial=True, context={'request': request})
        if serializer.is_valid():
            medicine = serializer.save()
            return Response(MedicineSez(medicine).data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        try:
            medicine = Medicine.objects.get(id=id)
        except Medicine.DoesNotExist:
            return Response({"detail": "Medicine not found."}, status=status.HTTP_404_NOT_FOUND)
        medicine.delete()
        return Response({"detail": "Medicine deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class CategoriesListAPIView(ListAPIView):
    queryset = Category.objects.all()
    serializer_class = CategoryIdNameSez

class UpdateMedicineStockView(APIView):
    permission_classes = [IsAuthenticated]
    def put(self, request, id):
        try:
            medicine = Medicine.objects.get(id=id)
        except Medicine.DoesNotExist:
            return Response({"detail": "Medicine not found."}, status=status.HTTP_404_NOT_FOUND)
        
        stock = medicine.stock
        serializer = MedicineStockSez(stock, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_by=request.user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MedicinesAPIView(ListAPIView):
    serializer_class = MedicineListSez
    pagination_class = CustomPagination
    
    def get_queryset(self):
        category_id = self.request.query_params.get('category_id')
        search_keyword = self.request.query_params.get('search', None)
        queryset = Medicine.objects.all()

        if category_id:
            queryset = queryset.filter(category_id=category_id)
        if search_keyword:
            queryset = queryset.filter(name__icontains=search_keyword)
        return queryset

    def get(self, request, *args, **kwargs):
        medicine_id = self.request.query_params.get('medicine_id')
        if medicine_id:
            try:
                medicine = Medicine.objects.get(pk=medicine_id)
            except Medicine.DoesNotExist:
                return Response({"error": "Medicine not found."}, status=status.HTTP_404_NOT_FOUND)    
            serializer = self.get_serializer(medicine)
            return Response(serializer.data, status=status.HTTP_200_OK)
        
        queryset = self.get_queryset()
        search_keyword = self.request.query_params.get('search')

        if search_keyword:
            serializer = self.get_serializer(queryset, many=True)
            return Response(serializer.data, status=status.HTTP_200_OK)
        if not queryset.exists():
            return Response([], status=status.HTTP_200_OK)

        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

class ProcessPrescription(APIView):
    def post(self, request):
        appointment_id = request.data.get("appointment_id")
        prescription_items = request.data.get("prescription_items", [])
        discount = request.data.get("discount", "0%")

        if not appointment_id or not prescription_items:
            return Response({"error": "Appointment ID or prescription items are missing."}, status=status.HTTP_400_BAD_REQUEST)
        try:
            appointment = Appointment.objects.get(id=appointment_id)
            patient = appointment.patient
            organization = appointment.doctor.organisation
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment not found."}, status=status.HTTP_404_NOT_FOUND)

        subtotal = 0.0
        response_items = []
        for item in prescription_items:
            medicine_id = item.get("id")
            quantity_requested = item.get("quantity_requested", 0)
            try:
                medicine = Medicine.objects.get(id=medicine_id)
                stock = medicine.stock
            except Medicine.DoesNotExist:
                return Response({"error": f"Medicine with product ID {medicine_id} not found."}, status=status.HTTP_404_NOT_FOUND)

            if stock.quantity < quantity_requested:
                return Response({"id": medicine.id, "name": medicine.name, "quantity_requested": quantity_requested,
                    "quantity_in_stock": stock.quantity, "status": "insufficient_stock"}, status=status.HTTP_400_BAD_REQUEST)

            amount_for_item = round(float(medicine.unit_price) * quantity_requested)
            subtotal += amount_for_item

            response_items.append({"id": medicine.id, "name": medicine.name, "quantity_requested": quantity_requested,
                "quantity_in_stock": stock.quantity, "unit_price": round(medicine.unit_price, 2), "amount_for_item": amount_for_item})

        discount_percentage = float(discount.strip('%'))
        discount_amount = round(subtotal * (discount_percentage / 100), 2)
        subtotal_after_discount = round(subtotal - discount_amount, 2)
        tax_rate = 0.06  # 6%
        cgst_amount = round(subtotal_after_discount * tax_rate, 2)
        sgst_amount = round(subtotal_after_discount * tax_rate, 2)
        total_amount = round(subtotal_after_discount + cgst_amount + sgst_amount)

        patient_data = PatintIdNameSez(patient).data
        organization_data = OrgDetailsSez(organization).data
        response_summary = {"appointment_id":appointment_id, "patient": patient_data, "organization": organization_data, "prescription_items": response_items,
            "cost_summary": {
                "subtotal": round(subtotal, 2),
                "discount_amount": discount_amount,
                "subtotal_after_discount": subtotal_after_discount,
                "CGST": {
                    "tax_percentage": "6.0%",
                    "tax_amount": cgst_amount
                },
                "SGST": {
                    "tax_percentage": "6.0%",
                    "tax_amount":  sgst_amount
                },
                "Total_amount": f"{total_amount}.00"}}
        return Response(response_summary, status=status.HTTP_200_OK)

class CustomerConfiguration(ListCreateAPIView):
    queryset = Customer.objects.all()
    pagination_class = CustomPagination
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return CustomerSez
        return CustomerListSez
    
    def perform_create(self, serializer):
        serializer.save()
        
    def get_queryset(self):
        queryset = super().get_queryset()
        mobile_number = self.request.query_params.get('mobile_number', None)
        full_name = self.request.query_params.get('full_name', None)
        if mobile_number or full_name:
            self.pagination_class = None
            if mobile_number:
                queryset = queryset.filter(mobile_number__icontains=mobile_number)
            if full_name:
                queryset = queryset.filter(full_name__icontains=full_name)
        return queryset
    
class CustomerPurchasesView(APIView):
    def get(self, request, id):
        try:
            customer = Customer.objects.get(pk=id)
        except Customer.DoesNotExist:
            raise ValidationError({"message": "Customer not found."})

        serializer = CustomerDetailSerializer(customer)
        return Response(serializer.data)
    
    def post(self, request, id):
        try:
            customer = Customer.objects.get(pk=id)
        except Customer.DoesNotExist:
            raise ValidationError({"message": "Customer not found."})
        
        data = request.data
        data['customer'] = customer.id
        serializer = CustomerPurchaseDetailSerializer(data=data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def put(self, request, id):
        try:
            purchase = CustomerPurchase.objects.get(pk=id)
        except CustomerPurchase.DoesNotExist:
            raise ValidationError({"message": "Purchase not found."})
        
        serializer = CustomerPurchaseDetailSerializer(purchase, data=request.data, partial=False)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    def delete(self, request, id):
        try:
            purchase = CustomerPurchase.objects.get(pk=id)
        except CustomerPurchase.DoesNotExist:
            raise ValidationError({"message": "Purchase not found."})
        purchase.delete()
        return Response({"message": "Purchase deleted successfully."}, status=status.HTTP_204_NO_CONTENT)

class PharmacyPayment(APIView):
    def post(self, request):
        prescription_items = request.data.get("prescription_items", [])
        serializer = PaymentCreateSerializer(data=request.data)
        
        if serializer.is_valid():
            payment = serializer.save()
            patient = payment.patient
            organization = serializer.validated_data['organization']
            appointment_id = request.data['appointment_id']
            response_items = []
            try:
                with transaction.atomic():
                    for item in prescription_items:
                        medicine_id = item.get("id")
                        quantity_requested = item.get("quantity_requested")
                        total = item.get("total")
                        try:
                            medicine = Medicine.objects.get(id=medicine_id)
                        except Medicine.DoesNotExist:
                            raise ValueError(f"Medicine with medicine ID {medicine_id} not found.")
                        try:
                            stock = MedicineStock.objects.get(medicine=medicine)
                        except MedicineStock.DoesNotExist:
                            raise ValueError(f"No stock information found for medicine {medicine.name}.")
                        stock.quantity -= quantity_requested
                        stock.save()
                        response_items.append({"id": medicine.id, "name": medicine.name, "price_per_unit": medicine.unit_price, "quantity_requested": quantity_requested, "total": total})
            except ValueError as e:
                return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

            context = {
                "organization": {
                    "name": organization.name,
                    "email": organization.email,
                    "mobile_number": organization.mobile_number,
                    "gst_no": organization.gst_no,
                    "address": {
                        "house_no": organization.address.house_no,
                        "area": organization.address.area,
                        "city": organization.address.city,
                        "state": organization.address.state,
                        "pin_code": organization.address.pin_code
                    },
                },
                "date": datetime.now().strftime("%d/%m/%Y"),
                "prescription_items": response_items,
                "cost_summary": {
                    "subtotal": payment.subtotal,
                    "discount_amount": payment.discount,
                    "CGST": {
                        "tax_percentage": "6.0%",
                        "tax_amount": payment.cgst,
                    },
                    "SGST": {
                        "tax_percentage": "6.0%",
                        "tax_amount": payment.sgst,
                    },
                    "Total_amount": payment.total_amount,
                },
            }

            html_content = render_to_string("invoice/pharmacy_invoice.html", context)

            try:
                pdf_data = pdfkit.from_string(html_content, options={"enable-local-file-access": ""})
            except Exception as e:
                return Response({"error": f"Failed to generate PDF: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
            pdf_obj=BytesIO(pdf_data)
            pdf_obj.seek(0)

            pharmacy_invoice = PharmacyInvoice(patient=patient)
            pharmacy_invoice.appointment_id = appointment_id
            pharmacy_invoice.url=f"patient/{patient.patient_id}/pharmacyinvoice_{appointment_id}.pdf"
            pharmacy_invoice.s3_url.save(f"pharmacyinvoice_{appointment_id}.pdf", ContentFile(pdf_obj.read()))

            return Response({"message": "Invoice generated successfully."}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PharmacyInvoiceS3URL(APIView):
    def get(self, request, appointment_id, format=None):
        try:
            incoice_obj = PharmacyInvoice.objects.get(appointment_id=appointment_id)
            appointment = Appointment.objects.get(id=appointment_id)
            serializer = PharmacyInvoiceSez(incoice_obj)
            return Response(serializer.data, status=status.HTTP_200_OK)
        except Appointment.DoesNotExist:
            return Response({"error": "Appointment Not Found"}, status=status.HTTP_404_NOT_FOUND)
        except PharmacyInvoice.DoesNotExist:
            return Response({"error": "Pharmacy Invoice Not Found"}, status=status.HTTP_404_NOT_FOUND)
