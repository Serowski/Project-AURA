"""
MQTT Bridge — subscribes to Mosquitto topics, persists data to PostgreSQL,
and broadcasts every message to all WebSocket clients.

Runs paho-mqtt in a background thread so it doesn't block the async event loop.
"""

from __future__ import annotations

import asyncio
import json
import logging
import random
import threading
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

from .config import MQTT_BROKER, MQTT_PORT, MQTT_TOPICS
from .database import async_session
from .models import SensorReading
from .ws_manager import manager

logger = logging.getLogger("aura.mqtt")


class MQTTBridge:
    """Bridges MQTT messages into the async world (DB + WebSocket)."""

    def __init__(self, loop: asyncio.AbstractEventLoop):
        self._loop = loop
        self._client_id = f"fastapi-bridge-{random.randint(1000, 9999)}"
        self._client = mqtt.Client(
            callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
            client_id=self._client_id,
        )
        self._client.on_connect = self._on_connect
        self._client.on_message = self._on_message
        self._client.on_disconnect = self._on_disconnect
        
        # Pamięć podręczna na najnowsze "raw" i "filtered" per urządzenie
        # rozwiązująca problem różniących się timestampów w paczkach od kolegów
        self._latest_state: dict[str, dict] = {}

    # ── MQTT callbacks (run in paho thread) ─────────────────────

    def _on_connect(self, client, userdata, flags, reason_code, properties):
        if reason_code == 0:
            logger.info("✅ MQTT connected to %s:%s", MQTT_BROKER, MQTT_PORT)
            for topic in MQTT_TOPICS:
                topic = topic.strip()
                client.subscribe(topic, qos=1)
                logger.info("👂 Subscribed: %s", topic)
        else:
            logger.error("❌ MQTT connect failed: %s", reason_code)

    def _on_message(self, client, userdata, msg):
        """Called from the paho thread — schedule async work on the event loop."""
        try:
            payload = json.loads(msg.payload.decode("utf-8"))
        except (json.JSONDecodeError, UnicodeDecodeError):
            logger.warning("Skipping non-JSON message on %s", msg.topic)
            return

        # Schedule the async handler on the FastAPI event loop
        asyncio.run_coroutine_threadsafe(
            self._handle_message(msg.topic, payload),
            self._loop,
        )

    def _on_disconnect(self, client, userdata, flags, reason_code, properties):
        logger.warning("⚠️  MQTT disconnected (code: %s)", reason_code)

    # ── Async handler ───────────────────────────────────────────

    async def _handle_message(self, topic: str, payload: dict):
        """Update latest state and process when the main 'data'/'final' message arrives."""
        try:
            device = payload.get("device", "unknown")
            
            if device not in self._latest_state:
                self._latest_state[device] = {"raw": {}, "filtered": {}}
            
            if topic.endswith("raw"):
                self._latest_state[device]["raw"] = payload.get("metrics", {})
            elif topic.endswith("filtered"):
                self._latest_state[device]["filtered"] = payload.get("metrics", {})
            elif topic.endswith("data") or topic.endswith("final"):
                # Główna paczka z analizą wyzwala zapis i wysyłkę na Front!
                ts_value = payload.get("ts")
                if ts_value is None:
                    return

                meta = payload.get("analysis", {})
                
                # Używamy aktualnego stanu raw i dodajemy domyślnie te metryki co przyszły w paczce `data` 
                # (chyba że mamy w cache lepsze "filtered")
                raw_metrics = dict(self._latest_state[device]["raw"])
                filtered_metrics = payload.get("metrics", {})
                
                # Zabezpieczenie przed wyciekiem (resetujemy cache dla urządzenia żeby nie wysyłać starych w nieskończoność)
                self._latest_state[device] = {"raw": {}, "filtered": {}}

                await self._process_complete_message(
                    device=device,
                    ts_value=ts_value,
                    raw=raw_metrics,
                    filtered=filtered_metrics,
                    meta=meta,
                    full_payload=payload
                )
                
        except Exception:
            logger.exception("Error handling partial MQTT message")

    async def _process_complete_message(self, device: str, ts_value: float, raw: dict, filtered: dict, meta: dict, full_payload: dict):
        """Persist combined data to DB and broadcast to WS clients."""
        try:
            if isinstance(ts_value, (int, float)):
                timestamp = datetime.fromtimestamp(ts_value, tz=timezone.utc)
            else:
                timestamp = datetime.now(timezone.utc)
                
            # Parsowanie procentu jako float ("50.3%" -> 50.3)
            risk_score_raw = meta.get("risk_percent", None)
            risk_score = None
            if risk_score_raw is not None:
                if isinstance(risk_score_raw, str):
                    try:
                        risk_score = float(risk_score_raw.replace("%", "").strip())
                    except ValueError:
                        pass
                elif isinstance(risk_score_raw, (int, float)):
                    risk_score = float(risk_score_raw)
                    
            risk_eval = meta.get("status", meta.get("risk_level", ""))

            # 1. Persist to PostgreSQL
            reading = SensorReading(
                device=device,
                timestamp=timestamp,
                node=meta.get("engine", ""),
                raw_temp=raw.get("temp", filtered.get("temp")),
                raw_humidity=raw.get("humidity", filtered.get("humidity")),
                raw_light=raw.get("light", filtered.get("light")),
                raw_dist=raw.get("dist", filtered.get("dist")),
                flt_temp=filtered.get("temp"),
                flt_humidity=filtered.get("humidity"),
                flt_light=filtered.get("light"),
                flt_dist=filtered.get("dist"),
                risk_eval=risk_eval,
                risk_score=risk_score,
                raw_payload=full_payload,
            )

            async with async_session() as session:
                session.add(reading)
                await session.commit()

            # 2. Broadcast to all WebSocket clients
            ws_message = {
                "type": "sensor_update",
                "device": device,
                "ts": timestamp.isoformat(),
                "raw": {
                    "temp": raw.get("temp", filtered.get("temp")),
                    "humidity": raw.get("humidity", filtered.get("humidity")),
                    "light": raw.get("light", filtered.get("light")),
                    "dist": raw.get("dist", filtered.get("dist")),
                },
                "filtered": {
                    "temp": filtered.get("temp"),
                    "humidity": filtered.get("humidity"),
                    "light": filtered.get("light"),
                    "dist": filtered.get("dist"),
                },
                "risk": {
                    "eval": risk_eval,
                    "score": risk_score,
                },
            }

            await manager.broadcast(ws_message)
            logger.debug("📡 Broadcast sensor_update for %s (triggered by final topic)", device)

        except Exception:
            logger.exception("Error processing complete message")

    # ── Lifecycle ───────────────────────────────────────────────

    def start(self):
        """Connect and start the MQTT loop in a daemon thread."""
        logger.info("🔌 Connecting MQTT to %s:%s ...", MQTT_BROKER, MQTT_PORT)
        self._client.connect(MQTT_BROKER, MQTT_PORT, keepalive=60)
        thread = threading.Thread(target=self._client.loop_forever, daemon=True)
        thread.start()

    def stop(self):
        self._client.disconnect()
        logger.info("🛑 MQTT bridge stopped.")
