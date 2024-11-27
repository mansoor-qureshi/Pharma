from django.db import models
from core.models import User, Organisation
from patient.models import Patient

class Category(models.Model):
    name = models.CharField(max_length=100, unique=True)
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)

    def save(self, *args, **kwargs):
        self.name = self.name.lower()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
    class Meta:
        ordering = ['-id']

class Medicine(models.Model):
    product_id = models.CharField(max_length=100, unique=True)
    name = models.CharField(max_length=100)
    drug = models.CharField(max_length=100, null=True, blank=True)
    category = models.ForeignKey(Category, on_delete=models.SET_NULL, null=True, blank=True, related_name='medicines')
    created_by = models.ForeignKey(User, on_delete=models.PROTECT)
    dosage = models.CharField(max_length=50, null=True, blank=True)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    expiry_date = models.DateField(null=True, blank=True)
    side_effects = models.TextField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.dosage} ({self.category})"
    
    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['name', 'category'], name='unique_name_category')
        ]

class MedicineStock(models.Model):
    medicine = models.OneToOneField(Medicine, on_delete=models.CASCADE, related_name='stock')
    quantity = models.PositiveIntegerField(default=0)
    reorder_level = models.PositiveIntegerField(default=10)
    updated_by = models.ForeignKey(User, on_delete=models.PROTECT)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.medicine} - Quantity: {self.quantity}"

    def is_low_stock(self):
        return self.quantity < self.reorder_level

    class Meta:
        ordering = ['quantity']

class Customer(models.Model):
    class Gender(models.TextChoices):
        MALE = "M", "male"
        FEMALE = "F", "female"
        OTHER = "O", "other"

    patient = models.ForeignKey(Patient, on_delete=models.SET_NULL, null=True, blank=True)
    full_name = models.CharField(max_length=255, blank=True, null=True)
    mobile_number = models.CharField(max_length=15, null=True, blank=True)
    gender = models.CharField(max_length=3, choices=Gender.choices, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-id']
        constraints = [models.UniqueConstraint(fields=['full_name', 'mobile_number'], name='unique_fullname_mobile')]
        indexes = [models.Index(fields=['mobile_number'])]

    def save(self, *args, **kwargs):
        if self.patient:
            self.full_name = f"{self.patient.first_name} {self.patient.last_name or ''}".strip()
            self.gender = self.patient.gender
            self.mobile_number = self.patient.mobile_number
        super().save(*args, **kwargs)

    def __str__(self):
        return self.full_name or "Unnamed Customer"

class CustomerPurchase(models.Model):
    customer = models.ForeignKey(Customer, on_delete=models.CASCADE, related_name='purchases')
    medicines = models.ManyToManyField(Medicine, related_name='purchases')
    medicines_list = models.JSONField(blank=True, null=True)
    total_cost = models.DecimalField(max_digits=10, decimal_places=2)
    purchase_date = models.DateTimeField(auto_now_add=True)
    payment_status = models.BooleanField(default=False)

    class Meta:
        ordering = ['-purchase_date']
        indexes = [models.Index(fields=['customer']),
            models.Index(fields=['payment_status']),
            models.Index(fields=['purchase_date']),]

    def __str__(self):
        return self.customer.full_name
    

    # def save(self, *args, **kwargs):
    #     if self.medicines.exists():
    #         self.medicines_list = [medicine.name for medicine in self.medicines.all()]
    #     super().save(*args, **kwargs)


class Payments(models.Model):
    class PaymentMethods(models.TextChoices):
        PHONEPE = "PhonePe", "PhonePe"
        PAYTM = "Paytm", "Paytm"
        CASH = "Cash", "Cash"
        BANK_TRANSFER = "Bank Transfer", "Bank Transfer"

    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='payments')
    payment_method = models.CharField(max_length=20, choices=PaymentMethods.choices, null=True, blank=True)
    subtotal = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0.0)
    cgst = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0.0)
    sgst = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0.0)
    discount = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True, default=0.0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    transaction_number = models.CharField(max_length=50, null=True, blank=True)
    is_online = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.payment_method} - {self.total_amount}"

def get_invoice_upload_path(instance, filename):
    return f'patient/{instance.patient.patient_id}/pharmacyinvoice_{instance.appointment_id}.pdf'

class PharmacyInvoice(models.Model):
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='inventory_prescriptions')
    appointment_id = models.IntegerField(null=True, blank=True)
    url = models.TextField(max_length=1000, null=True, blank=True)
    s3_url = models.FileField(upload_to=get_invoice_upload_path, null=True, blank=True)

    def __str__(self):
        return f"pharmacyinvoice for {self.patient.patient_id} (Appointment ID: {self.appointment_id})"
