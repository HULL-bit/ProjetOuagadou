from django.db import models
from apps.users.models import User

class Channel(models.Model):
    CHANNEL_TYPES = [
        ('public', 'Public'),
        ('private', 'Privé'),
        ('emergency', 'Urgence'),
        ('organization', 'Organisation'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    channel_type = models.CharField(max_length=20, choices=CHANNEL_TYPES, default='public')
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    members = models.ManyToManyField(User, related_name='channels', blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return self.name

class Message(models.Model):
    MESSAGE_TYPES = [
        ('text', 'Texte'),
        ('voice', 'Vocal'),
        ('location', 'Position'),
        ('image', 'Image'),
        ('file', 'Fichier'),
    ]
    
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    receiver = models.ForeignKey(User, on_delete=models.CASCADE, null=True, blank=True, 
                               related_name='received_messages')
    channel = models.ForeignKey(Channel, on_delete=models.CASCADE, null=True, blank=True)
    content = models.TextField()
    message_type = models.CharField(max_length=10, choices=MESSAGE_TYPES, default='text')
    file_attachment = models.FileField(upload_to='chat_files/', null=True, blank=True)
    metadata = models.JSONField(default=dict, blank=True)
    is_read = models.BooleanField(default=False)
    read_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['created_at']
        indexes = [
            models.Index(fields=['channel', 'created_at']),
            models.Index(fields=['sender', 'receiver']),
        ]
    
    def __str__(self):
        return f"{self.sender.username}: {self.content[:50]}"