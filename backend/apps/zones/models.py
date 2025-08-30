from django.db import models
from apps.users.models import User

class Zone(models.Model):
    ZONE_TYPES = [
        ('safety', 'Zone de Sécurité'),
        ('fishing', 'Zone de Pêche'),
        ('restricted', 'Zone Restreinte'),
        ('navigation', 'Zone de Navigation'),
    ]
    
    name = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    zone_type = models.CharField(max_length=20, choices=ZONE_TYPES)
    # Temporarily using JSONField instead of PostGIS
    coordinates = models.JSONField(help_text="GeoJSON polygon coordinates")
    radius = models.DecimalField(max_digits=8, decimal_places=2, null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['zone_type', 'is_active']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_zone_type_display()})"