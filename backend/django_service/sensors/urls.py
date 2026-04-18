"""
URL routing for the sensors API.
"""

from django.urls import path, include
from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register(r"alarms", views.AlarmViewSet, basename="alarm")

urlpatterns = [
    path("sensors/latest/", views.sensors_latest, name="sensors-latest"),
    path("sensors/history/", views.sensors_history, name="sensors-history"),
    path("sensors/devices/", views.sensors_devices, name="sensors-devices"),
    path("", include(router.urls)),
]
