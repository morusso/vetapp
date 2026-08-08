from django.urls import path

from user import views

urlpatterns = [
    path(
        "",
        views.SpecializationListCreateView.as_view(),
        name="specialization_list_create",
    ),
    path(
        "<int:pk>/",
        views.SpecializationDetailView.as_view(),
        name="specialization_detail",
    ),
]
