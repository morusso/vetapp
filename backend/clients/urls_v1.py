from django.urls import path

from clients import views

urlpatterns = [
    path("", views.ClientListCreateView.as_view(), name="client_list_create"),
    path("<int:pk>/", views.ClientDetailView.as_view(), name="client_detail"),
    path(
        "<int:pk>/full/",
        views.ClientDetailWithPatientsView.as_view(),
        name="client_detail_full",
    ),
]
