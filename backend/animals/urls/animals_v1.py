from django.urls import path

from animals import views

urlpatterns = [
    path("", views.AnimalListCreateView.as_view(), name="animal_list_create"),
    path("<int:pk>/", views.AnimalDetailView.as_view(), name="animal_detail"),
]
