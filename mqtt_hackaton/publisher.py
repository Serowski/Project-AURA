"""
MQTT Publisher — symuluje sensor temperatury.
Wysyła dane JSON na topic co PUBLISH_INTERVAL sekund.
"""

import json
import os
import random
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

# ── Konfiguracja z ENV ────────────────────────────────────────
BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", 1883))
TOPIC = os.getenv("MQTT_TOPIC", "mlottora/data")
INTERVAL = int(os.getenv("PUBLISH_INTERVAL", 5))
CLIENT_ID = os.getenv("MQTT_CLIENT_ID", f"publisher-{random.randint(1000, 9999)}")


def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print(f"✅ Połączono z brokerem {BROKER}:{PORT}")
    else:
        print(f"❌ Błąd połączenia: {reason_code}")


def on_disconnect(client, userdata, flags, reason_code, properties):
    print(f"⚠️  Rozłączono (kod: {reason_code}). Ponowne łączenie...")


def create_payload() -> dict:
    """Generuje przykładowy odczyt sensora."""
    return {
        "sensor_id": CLIENT_ID,
        "temperature": round(random.uniform(18.0, 35.0), 2),
        "humidity": round(random.uniform(30.0, 80.0), 2),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def main():
    client = mqtt.Client(
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        client_id=CLIENT_ID,
    )
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect

    print(f"🔌 Łączenie z {BROKER}:{PORT}...")
    client.connect(BROKER, PORT, keepalive=60)
    client.loop_start()

    try:
        while True:
            payload = create_payload()
            message = json.dumps(payload, ensure_ascii=False)
            result = client.publish(TOPIC, message, qos=1)

            if result.rc == mqtt.MQTT_ERR_SUCCESS:
                print(f"📤 [{TOPIC}] → {message}")
            else:
                print(f"❌ Błąd publikacji: {result.rc}")

            time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print("\n🛑 Zatrzymano publisher.")
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
