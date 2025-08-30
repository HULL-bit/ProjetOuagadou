from django.urls import path
from . import views

urlpatterns = [
    path('messages/', views.MessageListCreateView.as_view(), name='messages'),
    path('channels/', views.ChannelListCreateView.as_view(), name='channels'),
    path('upload/', views.upload_file, name='upload-file'),
]