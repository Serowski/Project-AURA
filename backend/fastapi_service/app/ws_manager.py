"""
WebSocket Connection Manager — broadcasts messages to all connected clients.
"""

from __future__ import annotations

import asyncio
import json
import logging
from collections import deque
from typing import Any

from fastapi import WebSocket

from .config import LIVE_BUFFER_SIZE

logger = logging.getLogger("aura.ws")


class ConnectionManager:
    """Manages active WebSocket connections and broadcasts sensor data."""

    def __init__(self):
        self._connections: list[WebSocket] = []
        self._lock = asyncio.Lock()
        # Ring buffer of recent points so new clients get immediate data
        self.buffer: deque[dict] = deque(maxlen=LIVE_BUFFER_SIZE)

    async def connect(self, ws: WebSocket):
        await ws.accept()
        async with self._lock:
            self._connections.append(ws)
        logger.info("WS client connected (%d total)", len(self._connections))

        # Send buffered history so the chart is not empty on connect
        if self.buffer:
            try:
                await ws.send_json({
                    "type": "history_backfill",
                    "points": list(self.buffer),
                })
            except Exception:
                pass

    async def disconnect(self, ws: WebSocket):
        async with self._lock:
            self._connections = [c for c in self._connections if c is not ws]
        logger.info("WS client disconnected (%d remaining)", len(self._connections))

    async def broadcast(self, data: dict[str, Any]):
        """Send data to every connected client. Remove dead connections."""
        self.buffer.append(data)

        message = json.dumps(data)
        dead: list[WebSocket] = []

        async with self._lock:
            targets = list(self._connections)

        for ws in targets:
            try:
                await ws.send_text(message)
            except Exception:
                dead.append(ws)

        if dead:
            async with self._lock:
                self._connections = [c for c in self._connections if c not in dead]


manager = ConnectionManager()
