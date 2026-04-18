"""
Configuration — all settings come from environment variables.
"""

import os


MQTT_BROKER = os.getenv("MQTT_BROKER", "mosquitto")
MQTT_PORT = int(os.getenv("MQTT_PORT", "1883"))
MQTT_TOPICS = os.getenv("MQTT_TOPICS", "mlottora/data").split(",")

DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "postgresql+asyncpg://aura:aura_pass@postgres:5432/aura_db",
)

# How many recent points to keep in the in-memory buffer for live WS clients
LIVE_BUFFER_SIZE = int(os.getenv("LIVE_BUFFER_SIZE", "300"))
