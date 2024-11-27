from django.contrib import admin
from .models import Category, Medicine, MedicineStock, Customer, CustomerPurchase, Payments, PharmacyInvoice

# Register your models here.
admin.site.register(Category)
admin.site.register(Medicine)
admin.site.register(MedicineStock)
admin.site.register(Customer)
admin.site.register(CustomerPurchase)
admin.site.register(Payments)
admin.site.register(PharmacyInvoice)