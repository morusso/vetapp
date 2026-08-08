from django.urls import path

from user import views

urlpatterns = [
    path(
        "change-password/", views.ChangePasswordView.as_view(), name="change_password"
    ),
]
