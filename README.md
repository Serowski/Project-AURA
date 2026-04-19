# Project AURA - Anomaly-driven Urban Risk Analyzer

> Viking-themed real-time environmental dashboard. Multi-sensor MQTT stream, FastAPI bridge, React frontend.

AURA (Anomaly-driven Urban Risk Analyzer) zbiera dane z sensorów IoT rozmieszczonych w Krakowie, filtruje je, klasyfikuje ryzyko i podaje ops-teamowi jako żywy dashboard w stylu nordyckiego command-center.

---

## Architektura

```
 ┌──────────────┐   MQTT    ┌──────────────┐    WS    ┌──────────────┐
 │  Sensor pub  │──────────▶│   Mosquitto  │─────────▶│   FastAPI    │
 │ (external)   │  1883     │   (broker)   │          │ WS + REST    │
 └──────────────┘           └──────────────┘          └──────┬───────┘
                                                             │
                                                             │ wss://…/sensors/stream
                                                             ▼
                                                      ┌──────────────┐
                                                      │   React UI   │
                                                      │  (Vite SPA)  │
                                                      └──────────────┘
```

Sensor (zewnętrzny host / `publisher.py`) publikuje JSON na `mlottora/data` → broker Mosquitto → Python subscriber w kontenerze → FastAPI-owy endpoint WebSocket wypycha `sensor_update` do frontendu.

---

## Metryki

Cztery główne KPI + mapa miasta + heatmapa. Każda metryka ma progi klasyfikacji, alarmy i wpisy do feedu.

| Metryka            | Jednostka | Stany (od niskiego do wysokiego)                        |
|--------------------|-----------|---------------------------------------------------------|
| Temperatura        | °C        | `FROZEN` → `COOL` → `WARM` → `HOT` → `CRIT`             |
| Wilgotność         | %         | `POLLUTED` → `HAZE` → `PURE`                            |
| Odległość (lidar)  | cm        | `BLOCKED` → `CLOSE` → `MID` → `CLEAR`                   |
| Natężenie światła  | %         | `IDLE` → `STEADY` → `PEAK` → `SURGE` → `OVERLOAD`       |

Progi w [`mjolnir-city-react/src/config/thresholds.js`](mjolnir-city-react/src/config/thresholds.js).

---

## Struktura repo

```
Project-AURA/
├── mjolnir-city-react/     # React 18 + Vite — frontend SPA
├── backend/                # (WIP) Django REST + FastAPI WS bridge
│   └── mosquitto/          # konfiguracja brokera
├── mqtt_hackaton/          # MQTT stack (Docker)
│   ├── docker-compose.yml  # mosquitto + subscriber
│   ├── mqtt.py             # wrapper paho-mqtt
│   ├── publisher.py        # symulator sensora (dev)
│   ├── subscriber.py       # odbiorca
│   └── Dockerfile
├── DEVLOG.md               # historia zmian (UI + logic fixes)
└── README.md
```

---

## Uruchomienie lokalnie

Potrzebujesz Docker Compose, Node 18+, npm.

### 1. Broker MQTT + subscriber

```bash
cd mqtt_hackaton
docker compose up -d
```

Sprawdź logi:

```bash
docker logs -f mqtt-subscriber
```

Jeśli chcesz symulować sensor (gdy nie masz zewnętrznego publisera), odkomentuj sekcję `publisher` w `docker-compose.yml` albo odpal lokalnie:

```bash
pip install -r requirements.txt
python publisher.py
```

### 2. Frontend

```bash
cd mjolnir-city-react
npm install
npm run dev
```

Otwórz `http://localhost:5173`.

Zmienne środowiskowe frontendu (opcjonalnie — masz domyślne):

```bash
# mjolnir-city-react/.env.local
VITE_SENSORS_WS_URL=ws://localhost:8001/ws/sensors/stream
VITE_API_BASE_URL=/api
```

### 3. Production build

```bash
cd mjolnir-city-react
npm run build       # wytwarza dist/
npm run preview     # serwuje dist/ na :4173
```

---

## Stack techniczny

**Frontend**
- React 18 + Vite 5
- Chart.js + react-chartjs-2 (wykresy line/radar)
- Native Canvas API (heatmap, city map)
- Pure CSS z CSS variables (bez Tailwind / styled-components)
- Pixel-art SVG (longship, shield, warrior, runestone)

**Backend / IoT**
- Eclipse Mosquitto 2.0 (MQTT broker)
- paho-mqtt 2.x (subscriber, publisher)
- Python 3.11 (kontenery)
- FastAPI (WebSocket bridge — WIP)
- Django REST (historia, alarmy — WIP)

---


