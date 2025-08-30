from rest_framework import generics, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
import os
from .models import Message, Channel
from .serializers import MessageSerializer, ChannelSerializer

class MessageListCreateView(generics.ListCreateAPIView):
    serializer_class = MessageSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        # Retourner tous les messages du canal général
        return Message.objects.all().order_by('created_at')
    
    def perform_create(self, serializer):
        serializer.save(sender=self.request.user)

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def upload_file(request):
    """
    Upload de fichiers pour le chat (images, audio, etc.)
    """
    try:
        file = request.FILES.get('file')
        folder = request.data.get('folder', 'chat')
        
        if not file:
            return Response({'error': 'Aucun fichier fourni'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Vérifier la taille du fichier (max 50MB)
        if file.size > 50 * 1024 * 1024:
            return Response({'error': 'Fichier trop volumineux (max 50MB)'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Générer un nom de fichier unique
        file_extension = os.path.splitext(file.name)[1]
        file_name = f"{folder}/{request.user.id}/{int(time.time())}{file_extension}"
        
        # Sauvegarder le fichier
        file_path = default_storage.save(file_name, ContentFile(file.read()))
        file_url = request.build_absolute_uri(default_storage.url(file_path))
        
        return Response({
            'file_url': file_url,
            'file_path': file_path,
            'file_name': file.name,
            'file_size': file.size,
            'content_type': file.content_type
        })
        
    except Exception as e:
        return Response({
            'error': 'Erreur lors de l\'upload',
            'details': str(e)
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ChannelListCreateView(generics.ListCreateAPIView):
    serializer_class = ChannelSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        user = self.request.user
        if user.role in ['admin', 'organization']:
            return Channel.objects.filter(is_active=True)
        return Channel.objects.filter(
            models.Q(channel_type='public') | 
            models.Q(members=user),
            is_active=True
        )
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)