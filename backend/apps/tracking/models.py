from django.db import models
from apps.users.models import User

class Location(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='locations')
    # Temporarily disabled PostGIS field - will re-enable when GDAL is available
    # position = models.PointField(geography=True)
    latitude = models.DecimalField(max_digits=10, decimal_places=8)
    longitude = models.DecimalField(max_digits=11, decimal_places=8)
    speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    heading = models.IntegerField(null=True, blank=True)
    altitude = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    accuracy = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    timestamp = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', '-timestamp']),
            models.Index(fields=['-timestamp']),
        ]
    
    def save(self, *args, **kwargs):
        # Temporarily disabled PostGIS functionality
        # if self.latitude and self.longitude:
        #     self.position = Point(float(self.longitude), float(self.latitude))
        super().save(*args, **kwargs)

class Trip(models.Model):
    STATUS_CHOICES = [
        ('active', 'En cours'),
        ('completed', 'Terminée'),
        ('cancelled', 'Annulée'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trips')
    start_time = models.DateTimeField()
    end_time = models.DateTimeField(null=True, blank=True)
    start_location = models.ForeignKey(Location, on_delete=models.SET_NULL, 
                                     null=True, related_name='trips_started')
    end_location = models.ForeignKey(Location, on_delete=models.SET_NULL, 
                                   null=True, related_name='trips_ended')
    distance_km = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    max_speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    avg_speed = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    fuel_consumed = models.DecimalField(max_digits=6, decimal_places=2, null=True, blank=True)
    catch_weight = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    notes = models.TextField(blank=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='active')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-start_time']

class TrackerDevice(models.Model):
    """Modèle pour les dispositifs de tracking GPS"""
    DEVICE_TYPES = [
        ('gps_tracker', 'Traqueur GPS'),
        ('smartphone', 'Smartphone'),
        ('satellite', 'Dispositif Satellite'),
    ]
    
    device_id = models.CharField(max_length=100, unique=True)
    device_type = models.CharField(max_length=20, choices=DEVICE_TYPES)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='devices')
    imei = models.CharField(max_length=20, blank=True, null=True)
    phone_number = models.CharField(max_length=20, blank=True, null=True)
    is_active = models.BooleanField(default=True)
    last_communication = models.DateTimeField(null=True, blank=True)
    battery_level = models.IntegerField(null=True, blank=True)
    signal_strength = models.IntegerField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.device_id} - {self.user.username}"