"""
mqtt.py — główny moduł MQTT z klasą MQTTClient.
Można go użyć jako bazę do budowania własnych serwisów.
"""

import json
import os
import random
from datetime import datetime, timezone
from typing import Callable

import paho.mqtt.client as mqtt


class MQTTClient:
    """Uniwersalny klient MQTT — wrapper na paho-mqtt v2."""

    def __init__(
        self,
        broker: str | None = None,
        port: int | None = None,
        client_id: str | None = None,
    ):
        self.broker = broker or os.getenv("MQTT_BROKER", "localhost")
        self.port = port or int(os.getenv("MQTT_PORT", 1883))
        self.client_id = client_id or f"client-{random.randint(1000, 9999)}"
        self._handlers: dict[str, list[Callable]] = {}

        self.client = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
            client_id=self.client_id,
        )
        self.client.on_connect = self._on_connect
        self.client.on_message = self._on_message
        self.client.on_disconnect = self._on_disconnect


    def _on_connect(self, client, userdata, flags, reason_code, properties):
        if reason_code == 0:
            print(f"✅ [{self.client_id}] Połączono z {self.broker}:{self.port}")
            # Re-subscribe po reconnect
            for topic in self._handlers:
                client.subscribe(topic, qos=1)
                print(f"👂 [{self.client_id}] Subskrypcja: {topic}")
        else:
            print(f"❌ [{self.client_id}] Błąd: {reason_code}")

    def _on_message(self, client, userdata, msg):
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            payload = msg.payload.decode("utf-8", errors="replace")

        # Dopasuj handlery (exact match + wildcard)
        for topic, handlers in self._handlers.items():
            if mqtt.topic_matches_sub(topic, msg.topic):
                for handler in handlers:
                    handler(msg.topic, payload)

    def _on_disconnect(self, client, userdata, flags, reason_code, properties):
        print(f"⚠️  [{self.client_id}] Rozłączono (kod: {reason_code})")


    def connect(self):
        """Nawiąż połączenie z brokerem."""
        print(f"🔌 [{self.client_id}] Łączenie z {self.broker}:{self.port}...")
        self.client.connect(self.broker, self.port, keepalive=60)
        return self

    def subscribe(self, topic: str, handler: Callable):
        """Zarejestruj handler na dany topic."""
        if topic not in self._handlers:
            self._handlers[topic] = []
            self.client.subscribe(topic, qos=1)
        self._handlers[topic].append(handler)
        return self

    def publish(self, topic: str, payload: dict | str, qos: int = 1):
        """Opublikuj wiadomość na topic."""
        if isinstance(payload, dict):
            payload["_ts"] = datetime.now(timezone.utc).isoformat()
            message = json.dumps(payload, ensure_ascii=False)
        else:
            message = str(payload)

        result = self.client.publish(topic, message, qos=qos)
        return result.rc == mqtt.MQTT_ERR_SUCCESS

    def loop_start(self):
        """Uruchom pętlę w tle (non-blocking)."""
        self.client.loop_start()
        return self

    def loop_forever(self):
        """Uruchom pętlę blokującą."""
        self.client.loop_forever()

    def disconnect(self):
        """Rozłącz klienta."""
        self.client.loop_stop()
        self.client.disconnect()
        print(f"🛑 [{self.client_id}] Rozłączono.")


if __name__ == "__main__":
    def handle_message(topic: str, payload):
        print(f"📥 [{topic}] → {payload}")

    client = MQTTClient()
    client.connect()
    client.subscribe("test/#", handle_message)
    print("Nasłuchuję na test/#... (Ctrl+C aby zakończyć)")

    try:
        client.loop_forever()
    except KeyboardInterrupt:
        client.disconnect()