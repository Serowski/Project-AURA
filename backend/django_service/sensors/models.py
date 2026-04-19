"""
Django ORM models — maps to the same tables created by init_db.sql.

managed = False  ← Django won't try to create/alter these tables.
FastAPI (via SQLAlchemy) and Django share the same PostgreSQL schema.
"""

from django.db import models


class SensorReading(models.Model):
    """One row per MQTT message received from a sensor device."""

    device = models.CharField(max_length=64)
    timestamp = models.DateTimeField()
    node = models.CharField(max_length=64, blank=True, null=True)

    # Layer 1: RAW
    raw_temp = models.FloatField(null=True)
    raw_humidity = models.FloatField(null=True)
    raw_light = models.FloatField(null=True)
    raw_dist = models.FloatField(null=True)

    # Layer 2: Kalman-filtered
    flt_temp = models.FloatField(null=True)
    flt_humidity = models.FloatField(null=True)
    flt_light = models.FloatField(null=True)
    flt_dist = models.FloatField(null=True)

    # Layer 3: AI risk
    risk_eval = models.CharField(max_length=16, blank=True, null=True)
    risk_score = models.FloatField(null=True)

    # Metadata
    raw_payload = models.JSONField(null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False  # Table created by init_db.sql
        db_table = "sensor_readings"
        ordering = ["-timestamp"]

    def __str__(self):
        return f"{self.device} @ {self.timestamp}"


class Alarm(models.Model):
    """Alarm events raised by the system or thresholds."""

    device = models.CharField(max_length=64, blank=True, null=True)
    alarm_type = models.CharField(max_length=64)
    message = models.TextField(blank=True, null=True)
    severity = models.CharField(max_length=16, default="WARN")
    acknowledged = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        managed = False  # Table created by init_db.sql
        db_table = "alarms"
        ordering = ["-created_at"]

    def __str__(self):
        return f"[{self.severity}] {self.alarm_type} — {self.device}"
