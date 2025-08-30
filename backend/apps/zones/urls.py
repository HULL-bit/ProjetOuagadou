from django.urls import path
from . import views

urlpatterns = [
    path('', views.ZoneListCreateView.as_view(), name='zones'),
    path('<int:pk>/', views.ZoneDetailView.as_view(), name='zone-detail'),
]