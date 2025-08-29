from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from django.utils import timezone
from .models import Location, Trip, TrackerDevice
from .serializers import LocationSerializer, TripSerializer, TrackerDeviceSerializer

class LocationListCreateView(generics.ListCreateAPIView):
    serializer_class = LocationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Location.objects.all()
        return Location.objects.filter(user=user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user, timestamp=timezone.now())

@api_view(['POST'])
@permission_classes([AllowAny])  # Pour permettre aux traqueurs d'envoyer des données
def tracker_webhook(request):
    """
    Endpoint pour recevoir les données des traqueurs GPS
    """
    try:
        data = request.data
        device_id = data.get('device_id')
        
        if not device_id:
            return Response({'error': 'device_id requis'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Trouver le dispositif
        try:
            device = TrackerDevice.objects.get(device_id=device_id, is_active=True)
        except TrackerDevice.DoesNotExist:
            return Response({'error': 'Dispositif non trouvé'}, status=status.HTTP_404_NOT_FOUND)
        
        # Créer la position
        location_data = {
            'user': device.user.id,
            'latitude': data.get('latitude'),
            'longitude': data.get('longitude'),
            'speed': data.get('speed'),
            'heading': data.get('heading'),
            'altitude': data.get('altitude'),
            'accuracy': data.get('accuracy'),
            'timestamp': timezone.now()
        }
        
        serializer = LocationSerializer(data=location_data)
        if serializer.is_valid():
            location = serializer.save()
            
            # Mettre à jour le dispositif
            device.last_communication = timezone.now()
            device.battery_level = data.get('battery_level')
            device.signal_strength = data.get('signal_strength')
            device.save()
            
            # Mettre à jour l'utilisateur
            device.user.last_location_update = timezone.now()
            device.user.is_active_session = True
            device.user.save()
            
            return Response({
                'status': 'success',
                'location_id': location.id,
                'message': 'Position enregistrée'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    except Exception as e:
        return Response({
            'error': 'Erreur serveur',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TripListCreateView(generics.ListCreateAPIView):
    serializer_class = TripSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Trip.objects.all()
        return Trip.objects.filter(user=user)

class TrackerDeviceListView(generics.ListCreateAPIView):
    serializer_class = TrackerDeviceSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return TrackerDevice.objects.all()
        return TrackerDevice.objects.filter(user=user)