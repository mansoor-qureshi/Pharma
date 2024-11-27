from django.urls import path
from core.views import UserCreate, CampaignListCreateView, PasswordResetRequest, PasswordResetVerify

urlpatterns = [
    path('users/', UserCreate.as_view(), name='user-create'),
    path('campaigns/', CampaignListCreateView.as_view(), name='campaign-list-create'),
    path('passwordreset/request/', PasswordResetRequest.as_view(), name='password_reset_request'),
    path('passwordreset/', PasswordResetVerify.as_view(), name='password_reset_verify'),


]
