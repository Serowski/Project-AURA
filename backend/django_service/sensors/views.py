"""
REST views for sensor data and alarms.

Key endpoint: /api/sensors/history/?metric=temp
Returns time-series data with all 3 layers (raw, filtered, risk_score)
ready for Chart.js consumption.
"""

from datetime import timedelta

from django.utils import timezone
from rest_framework import viewsets, status
from rest_framework.decorators import api_view
from rest_framework.response import Response

from .models import SensorReading, Alarm
from .serializers import SensorReadingSerializer, AlarmSerializer


# ── Metric field mapping ────────────────────────────────────

METRIC_FIELDS = {
    "temp":     ("raw_temp",     "flt_temp"),
    "humidity": ("raw_humidity", "flt_humidity"),
    "light":    ("raw_light",    "flt_light"),
    "dist":     ("raw_dist",     "flt_dist"),
}

WINDOW_DELTAS = {
    "5m":  timedelta(minutes=5),
    "15m": timedelta(minutes=15),
    "1h":  timedelta(hours=1),
    "6h":  timedelta(hours=6),
    "24h": timedelta(hours=24),
    "7d":  timedelta(days=7),
}


# ── Sensor endpoints ────────────────────────────────────────

@api_view(["GET"])
def sensors_latest(request):
    """
    GET /api/sensors/latest/
    Returns the most recent reading per device.
    """
    devices = SensorReading.objects.values_list("device", flat=True).distinct()
    results = []
    for device in devices:
        reading = SensorReading.objects.filter(device=device).first()
        if reading:
            results.append(SensorReadingSerializer(reading).data)
    return Response(results)


@api_view(["GET"])
def sensors_history(request):
    """
    GET /api/sensors/history/?metric=temp&window=1h&device=MockAmulet_01&limit=500

    Returns time-series points with all 3 layers for the requested metric.
    Response format:
    {
      "metric": "temp",
      "device": "MockAmulet_01",
      "points": [
        { "ts": "...", "raw": 22.41, "filtered": 22.46, "risk_score": 12.5 },
        ...
      ]
    }
    """
    metric = request.query_params.get("metric", "temp")
    window = request.query_params.get("window", "1h")
    device = request.query_params.get("device")
    limit = int(request.query_params.get("limit", "500"))

    if metric not in METRIC_FIELDS:
        return Response(
            {"error": f"Invalid metric. Choose from: {list(METRIC_FIELDS.keys())}"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    raw_field, flt_field = METRIC_FIELDS[metric]

    # Time window filter
    delta = WINDOW_DELTAS.get(window)
    qs = SensorReading.objects.all()

    if delta:
        since = timezone.now() - delta
        qs = qs.filter(timestamp__gte=since)

    if device:
        qs = qs.filter(device=device)

    # Order ascending (oldest first) for chart x-axis
    qs = qs.order_by("timestamp")[:limit]

    points = []
    for r in qs:
        points.append({
            "ts": r.timestamp.isoformat() if r.timestamp else None,
            "raw": getattr(r, raw_field),
            "filtered": getattr(r, flt_field),
            "risk_score": r.risk_score,
        })

    return Response({
        "metric": metric,
        "device": device or "all",
        "window": window,
        "count": len(points),
        "points": points,
    })


@api_view(["GET"])
def sensors_devices(request):
    """
    GET /api/sensors/devices/
    Returns list of unique device identifiers.
    """
    devices = (
        SensorReading.objects
        .values_list("device", flat=True)
        .distinct()
    )
    return Response({"devices": list(devices)})


# ── Alarms ──────────────────────────────────────────────────

class AlarmViewSet(viewsets.ModelViewSet):
    """
    Full CRUD for alarms.
    GET /api/alarms/        — list alarms
    POST /api/alarms/       — create alarm
    PATCH /api/alarms/:id/  — acknowledge alarm
    """
    queryset = Alarm.objects.all()
    serializer_class = AlarmSerializer
