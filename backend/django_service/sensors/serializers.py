"""
DRF serializers for sensor readings and alarms.
"""

from rest_framework import serializers
from .models import SensorReading, Alarm


class SensorReadingSerializer(serializers.ModelSerializer):
    class Meta:
        model = SensorReading
        fields = [
            "id", "device", "timestamp", "node",
            "raw_temp", "raw_humidity", "raw_light", "raw_dist",
            "flt_temp", "flt_humidity", "flt_light", "flt_dist",
            "risk_eval", "risk_score",
            "created_at",
        ]


class SensorHistoryPointSerializer(serializers.Serializer):
    """Flat point format optimized for Chart.js consumption."""
    ts = serializers.DateTimeField(source="timestamp")
    raw = serializers.FloatField()
    filtered = serializers.FloatField()
    risk_score = serializers.FloatField()


class AlarmSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alarm
        fields = "__all__"
