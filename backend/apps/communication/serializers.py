from rest_framework import serializers
from .models import Message, Channel
from apps.users.serializers import UserSerializer

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source='sender.profile.full_name', read_only=True)
    receiver_name = serializers.CharField(source='receiver.profile.full_name', read_only=True)
    
    class Meta:
        model = Message
        fields = ['id', 'sender', 'sender_name', 'receiver', 'receiver_name', 
                 'content', 'message_type', 'file_attachment', 'metadata', 
                 'is_read', 'read_at', 'created_at']
        read_only_fields = ['id', 'created_at', 'sender_name', 'receiver_name']

class ChannelSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.profile.full_name', read_only=True)
    member_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Channel
        fields = ['id', 'name', 'description', 'channel_type', 'created_by', 
                 'created_by_name', 'member_count', 'is_active', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by_name', 'member_count']
    
    def get_member_count(self, obj):
        return obj.members.count()