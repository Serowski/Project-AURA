"""
Django Admin registration for sensor models.
"""

from django.contrib import admin
from .models import SensorReading, Alarm


@admin.register(SensorReading)
class SensorReadingAdmin(admin.ModelAdmin):
    list_display = [
        "device", "timestamp", "node",
        "flt_temp", "flt_humidity", "flt_light", "flt_dist",
        "risk_eval", "risk_score",
    ]
    list_filter = ["device", "node", "risk_eval"]
    search_fields = ["device", "node"]
    ordering = ["-timestamp"]
    readonly_fields = ["raw_payload", "created_at"]


@admin.register(Alarm)
class AlarmAdmin(admin.ModelAdmin):
    list_display = ["alarm_type", "device", "severity", "acknowledged", "created_at"]
    list_filter = ["severity", "acknowledged", "device"]
    ordering = ["-created_at"]
