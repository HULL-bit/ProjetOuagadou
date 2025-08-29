from rest_framework import serializers
from .models import Location, Trip, TrackerDevice

class LocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Location
        fields = ['id', 'user', 'latitude', 'longitude', 'speed', 'heading', 
                 'altitude', 'accuracy', 'timestamp', 'created_at']
        read_only_fields = ['id', 'created_at']

class TripSerializer(serializers.ModelSerializer):
    start_location = LocationSerializer(read_only=True)
    end_location = LocationSerializer(read_only=True)
    
    class Meta:
        model = Trip
        fields = ['id', 'user', 'start_time', 'end_time', 'start_location', 
                 'end_location', 'distance_km', 'max_speed', 'avg_speed', 
                 'fuel_consumed', 'catch_weight', 'notes', 'status', 
                 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']

class TrackerDeviceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TrackerDevice
        fields = ['id', 'device_id', 'device_type', 'user', 'imei', 
                 'phone_number', 'is_active', 'last_communication', 
                 'battery_level', 'signal_strength', 'created_at', 'updated_at']
        read_only_fields = ['id', 'created_at', 'updated_at']