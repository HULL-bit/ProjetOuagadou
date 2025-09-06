from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from .models import Zone
from .serializers import ZoneSerializer

class ZoneListCreateView(generics.ListCreateAPIView):
    serializer_class = ZoneSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Zone.objects.filter(is_active=True)
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

class ZoneDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ZoneSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Zone.objects.all()
        return Zone.objects.filter(created_by=user)