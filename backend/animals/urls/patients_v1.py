from django.urls import path

from animals import views

urlpatterns = [
    path("", views.PatientListCreateView.as_view(), name="patient_list_create"),
    path("<int:pk>/", views.PatientDetailView.as_view(), name="patient_detail"),
    path(
        "weights/",
        views.PatientWeightListCreateView.as_view(),
        name="patient_weight_list_create",
    ),
    path(
        "weights/<int:pk>/",
        views.PatientWeightDetailView.as_view(),
        name="patient_weight_detail",
    ),
]
