"""
FastAPI application — AURA real-time sensor gateway.

- Starts MQTT bridge on startup (subscribes to Mosquitto)
- Exposes WebSocket at /ws/sensors/stream
- Health-check at /health
"""

from __future__ import annotations

import asyncio
import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware

from .mqtt_bridge import MQTTBridge
from .ws_manager import manager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(name)-16s | %(levelname)-5s | %(message)s",
)
logger = logging.getLogger("aura.app")

_bridge: MQTTBridge | None = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Start MQTT bridge on startup, stop on shutdown."""
    global _bridge
    loop = asyncio.get_running_loop()
    _bridge = MQTTBridge(loop)
    _bridge.start()
    logger.info("🚀 AURA FastAPI gateway started")
    yield
    _bridge.stop()
    logger.info("👋 AURA FastAPI gateway stopped")


app = FastAPI(
    title="AURA Sensor Gateway",
    description="Real-time MQTT → WebSocket bridge for Project AURA",
    version="0.1.0",
    lifespan=lifespan,
)

# Allow frontend dev server
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Health check ────────────────────────────────────────────

@app.get("/health")
async def health():
    return {
        "status": "ok",
        "service": "fastapi-gateway",
        "ws_clients": len(manager._connections),
        "buffer_size": len(manager.buffer),
    }


# ── WebSocket endpoint ──────────────────────────────────────

@app.websocket("/ws/sensors/stream")
async def websocket_sensor_stream(ws: WebSocket):
    """
    Live sensor stream.

    On connect, the client receives a `history_backfill` message with
    the last N data points, then receives `sensor_update` messages
    in real time as MQTT data arrives.
    """
    await manager.connect(ws)
    try:
        while True:
            # Keep connection alive — wait for client pings / close
            await ws.receive_text()
    except WebSocketDisconnect:
        await manager.disconnect(ws)
    except Exception:
        await manager.disconnect(ws)
