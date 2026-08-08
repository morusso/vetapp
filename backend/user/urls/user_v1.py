from django.urls import path

from user import views

urlpatterns = [
    path("", views.UserListCreateView.as_view(), name="user_list_create"),
]
