from django.urls import path

from clinical_data import views

urlpatterns = [
    path(
        "medicines/",
        views.MedicineListCreateView.as_view(),
        name="medicine_list_create",
    ),
    path(
        "medicines/<int:pk>/",
        views.MedicineDetailView.as_view(),
        name="medicine_detail",
    ),
    path(
        "medicines/batches/",
        views.MedicineBatchListCreateView.as_view(),
        name="medicine_batch_list_create",
    ),
    path(
        "medicines/batches/<int:pk>/",
        views.MedicineBatchDetailView.as_view(),
        name="medicine_batch_detail",
    ),
]
