from django.contrib import admin
from .models import User,Day, Address, Organisation, PasswordReset

# Register your models here.
admin.site.register(User)
admin.site.register(Day)
admin.site.register(Address)
admin.site.register(Organisation)
admin.site.register(PasswordReset)