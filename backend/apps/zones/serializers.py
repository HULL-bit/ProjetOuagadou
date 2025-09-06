from rest_framework import serializers
from .models import Zone

class ZoneSerializer(serializers.ModelSerializer):
    created_by_name = serializers.CharField(source='created_by.profile.full_name', read_only=True)
    
    class Meta:
        model = Zone
        fields = ['id', 'name', 'description', 'zone_type', 'coordinates', 
                 'radius', 'is_active', 'created_by', 'created_by_name', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by_name']