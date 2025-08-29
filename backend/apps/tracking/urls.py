from django.urls import path
from . import views

urlpatterns = [
    path('locations/', views.LocationListCreateView.as_view(), name='locations'),
    path('trips/', views.TripListCreateView.as_view(), name='trips'),
    path('devices/', views.TrackerDeviceListView.as_view(), name='devices'),
    path('webhook/tracker/', views.tracker_webhook, name='tracker-webhook'),
]