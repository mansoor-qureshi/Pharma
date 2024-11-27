from rest_framework import serializers
from rest_framework.serializers import ModelSerializer
from rest_framework.exceptions import ValidationError
from core.serializers import UserNameIdSerializer
from .models import Category, Medicine, MedicineStock, Customer, CustomerPurchase, Payments, PharmacyInvoice
from patient.models import Appointment

class CategorySez(ModelSerializer):
    class Meta:
        model = Category
        fields = ['name']

class CategoryListSez(ModelSerializer):
    created_by = UserNameIdSerializer()
    class Meta:
        model = Category
        fields = '__all__'

class CategoryIdNameSez(ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class MedicineStockSez(ModelSerializer):
    class Meta:
        model = MedicineStock
        fields = ['quantity', 'reorder_level']

class MedicineListSez(serializers.ModelSerializer):
    stock = MedicineStockSez(read_only=True)
    category = CategoryIdNameSez(read_only=True)
    created_by = UserNameIdSerializer(read_only=True)

    class Meta:
        model = Medicine
        fields = '__all__'

class MedicineSez(serializers.ModelSerializer):
    category = serializers.CharField()
    stock = MedicineStockSez()

    class Meta:
        model = Medicine
        fields = [
            'product_id', 'name', 'drug', 'category', 'dosage', 'unit_price',
            'expiry_date', 'side_effects', 'stock'
        ]

    def validate(self, attrs):
        category_name = attrs.get('category').lower()
        category = self.get_category(category_name)

        medicine_id = self.instance.id if self.instance else None
        if Medicine.objects.filter(name=attrs.get('name'), category=category).exclude(id=medicine_id).exists():
            raise ValidationError({"name": "A medicine with this name already exists in this category."})

        attrs['category'] = category
        return attrs

    def get_category(self, category_name):
        try:
            return Category.objects.get(name=category_name)
        except Category.DoesNotExist:
            raise ValidationError({"category": "Category with this name does not exist."})

    def create(self, validated_data):
        user = self.context['request'].user        
        stock_data = validated_data.pop('stock')
        category = validated_data.pop('category')

        medicine = Medicine.objects.create(created_by=user, category=category, **validated_data)        
        MedicineStock.objects.create(medicine=medicine, updated_by=user, **stock_data)
        return medicine

    def update(self, instance, validated_data):
        stock_data = validated_data.pop('stock', None)
        category_name = validated_data.pop('category', instance.category.name)
        category = self.get_category(category_name)
        validated_data['category'] = category

        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        if stock_data:
            for attr, value in stock_data.items():
                setattr(instance.stock, attr, value)
            instance.stock.updated_by = self.context['request'].user
            instance.stock.save()
        return instance

class CustomerSez(ModelSerializer):
    class Meta:
        model = Customer
        fields = ['full_name', 'mobile_number', 'gender']

    def validate(self, data):
        full_name = data.get('full_name')
        mobile_number = data.get('mobile_number')
        if Customer.objects.filter(full_name=full_name, mobile_number=mobile_number).exists():
            raise ValidationError({"message": "A customer with this full name and mobile number already exists."})
        return data

class CustomerListSez(ModelSerializer):
    class Meta:
        model = Customer
        fields = ['id', 'full_name', 'mobile_number', 'gender', 'created_at']

class MedicineSerializer(serializers.ModelSerializer):
    """Serializer for Medicine details."""
    class Meta:
        model = Medicine
        fields = ['id', 'name']


class CustomerPurchaseDetailSerializer(serializers.ModelSerializer):
    """Serializer for CustomerPurchase details."""
    medicines = MedicineSerializer(many=True)  # Use nested serializer for medicines

    class Meta:
        model = CustomerPurchase
        fields = [
            'id', 'medicines', 'medicines_list', 'total_cost', 'purchase_date',
            'payment_status'
        ]

class CustomerDetailSerializer(serializers.ModelSerializer):
    """Serializer for Customer details, including purchases."""
    all_purchases = CustomerPurchaseDetailSerializer(many=True, source='purchases')  # Fetch related purchases

    class Meta:
        model = Customer
        fields = [
            'id', 'full_name', 'gender', 'mobile_number', 'all_purchases'
        ]

class CustomerPurchaseDetailSerializer(serializers.ModelSerializer):
    """Serializer for creating and retrieving CustomerPurchase details."""
    medicines = serializers.PrimaryKeyRelatedField(queryset=Medicine.objects.all(), many=True)
    customer = serializers.PrimaryKeyRelatedField(read_only=True)

    class Meta:
        model = CustomerPurchase
        fields = [
            'id', 'customer', 'medicines', 'medicines_list', 'total_cost', 'purchase_date',
            'payment_status'
        ]
        read_only_fields = ['id', 'customer', 'medicines_list', 'purchase_date']

    def validate(self, data):
        medicines = data.get('medicines')
        if not medicines:
            raise serializers.ValidationError({"medicines": "At least one medicine must be added to the purchase."})
        invalid_medicine_ids = [medicine.id for medicine in medicines if not Medicine.objects.filter(id=medicine.id).exists()]
        if invalid_medicine_ids:
            raise serializers.ValidationError({"medicines": f"Invalid medicine IDs: {invalid_medicine_ids}"})
        return data

    def create(self, validated_data):
        medicines = validated_data.pop('medicines', [])
        purchase = CustomerPurchase.objects.create(**validated_data)
        purchase.medicines.set(medicines)
        return purchase
    
    def update(self, instance, validated_data):
        medicines = validated_data.pop('medicines', [])
        instance.medicines.set(medicines)
        instance.total_cost = validated_data.get('total_cost', instance.total_cost)
        instance.payment_status = validated_data.get('payment_status', instance.payment_status)
        instance.save()
        return instance

class PaymentCreateSerializer(ModelSerializer):
    appointment_id = serializers.IntegerField(write_only=True)

    class Meta:
        model = Payments
        fields = ['appointment_id', 'payment_method', 'subtotal', 'cgst', 'sgst', 'discount', 'total_amount', 'transaction_number', 'is_online']

    def validate(self, data):
        try:
            appointment = Appointment.objects.get(id=data['appointment_id'])
        except Appointment.DoesNotExist:
            raise serializers.ValidationError("Invalid appointment_id provided.")
        
        if PharmacyInvoice.objects.filter(appointment_id=data['appointment_id']).exists():
            raise serializers.ValidationError("A pharmacy invoice for this appointment already exists.")
        
        if data['transaction_number']:
            if Payments.objects.filter(transaction_number=data['transaction_number']).exists():
                raise serializers.ValidationError("This transaction_number already exists.")
        
        data['patient'] = appointment.patient
        data['organization'] = appointment.doctor.organisation
        return data

    def create(self, validated_data):
        validated_data.pop('appointment_id')
        validated_data.pop('organization')
        payment = Payments.objects.create(**validated_data)
        return payment

class PharmacyInvoiceSez(ModelSerializer):
    class Meta:
        model = PharmacyInvoice
        fields = ['s3_url']