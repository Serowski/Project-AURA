# Project AURA

Real-time sensor monitoring and AI-powered anomaly detection system for edge computing environments. AURA collects data from Bluetooth Low Energy (BLE) devices, processes it through multiple filtering stages, and provides live dashboards with risk analysis.

## Project Overview

Project AURA is an advanced Internet of Things (IoT) monitoring and anomaly detection platform designed for real-time environmental surveillance and risk assessment. It represents a complete end-to-end solution for collecting, processing, analyzing, and visualizing sensor data from distributed edge devices.

### What is AURA?

AURA stands as a sophisticated multi-layered system that enables organizations to monitor physical environments through connected sensor networks. The platform is specifically engineered to detect environmental anomalies and potential disaster scenarios (fire outbreaks, extreme weather conditions, unauthorized intrusions) by analyzing streams of sensor data in real-time.

The core innovation of AURA lies in its ability to process sensor readings through multiple analytical stages:

1. **Raw Data Acquisition**: BLE devices (such as the nRF54L15-based "Amulet Mlot Thor") communicate wirelessly with edge collectors, capturing metrics like temperature, humidity, light levels, and proximity distance.

2. **Signal Conditioning**: Raw sensor data inherently contains noise and measurement errors. A Julia-based Kalman filter smooths these signals, providing cleaner data while preserving genuine environmental changes.

3. **Intelligent Analysis**: A Python-based AI engine (using Isolation Forest algorithm) analyzes the filtered data to identify statistical anomalies and classify them into specific disaster categories:
   - FIRE: Characterized by high temperature, high humidity, intense light, and stable pressure
   - TOO_MUCH_LIGHT: Abnormal light levels indicating potential hazards
   - STORM: Indicates rapid pressure drops, extreme humidity changes, and variable conditions
   - INTRUDER: Close proximity detection combined with activity patterns

4. **Real-Time Dashboarding**: A Viking-themed React web application (Mjolnir City) presents live sensor data, historical trends, geographic mapping, and alert notifications through an intuitive interface.

### Key Characteristics

**Distributed Architecture**: The system separates edge collection (near sensors) from cloud processing (analytics and storage), reducing latency and bandwidth requirements.

**Multi-Sensor Fusion**: AURA intelligently combines multiple sensor types (temperature, humidity, light, distance, pressure) to develop a holistic understanding of environmental conditions rather than relying on single-point measurements.

**Real-Time Processing**: WebSocket connections enable live data streaming to dashboard clients with minimal latency, allowing immediate situational awareness.

**Historical Persistence**: All sensor readings and their analytical results are stored in PostgreSQL, enabling trend analysis, anomaly retrospection, and compliance auditing.

**Scalable Design**: The MQTT-based message bus allows multiple sensors, filters, and analysis engines to operate independently and scale horizontally. New sensors can be added without modifying existing infrastructure.

**Production-Ready**: The system implements proper error handling, connection resilience, credential management, and supports VPN tunneling for secure device-to-cloud communication in restricted network environments.

### Use Cases

- **Facility Monitoring**: Monitor office buildings, warehouses, and data centers for fire hazards, environmental anomalies, and security threats
- **Environmental Protection**: Track weather conditions and geological stability in remote locations
- **Process Control**: Detect anomalies in industrial environments where precise environmental conditions are critical
- **Smart Buildings**: Integrate with building management systems for automated response to detected anomalies
- **Research**: Collect long-term environmental data for climate and condition studies

## Architecture

```
BLE Sensors
    |
    v
BLE Collector (aura_edgenode)
    |
    v
MQTT Broker (Mosquitto) - topics: sensors/raw, sensors/filtered, sensors/final
    |
    +---> Julia Filter (Kalman smoothing)
    |
    +---> Python AI Service (Anomaly detection & risk classification)
    |
    v
FastAPI Gateway (Real-time WebSocket bridge)
    |
    v
React Dashboard (Mjolnir City)
    |
    +--- PostgreSQL (Historical data storage)
    |
    +--- Django REST API (Data access layer)
```

## Project Structure

### `aura_edgenode`
Edge node implementation for BLE data collection and processing:

- **ble_mqtt_gateway/**
  - `ble_collector.py` - Connects to BLE devices and publishes raw sensor data to MQTT
  - `ble_mqtt_gateway.py` - Main gateway orchestrator with VPN support
  - `vpn_manager.py` - OpenVPN management for secure connections
  - `vpn_uplink.py` - VPN uplink bridge between local and remote MQTT brokers
  - `mock_sensors.py` - Test data generator simulating multiple sensor scenarios
  - `docker-compose.yaml` - Container orchestration for edge components

- **aifiltering/**
  - `julia/` - Julia-based Kalman filter for sensor data smoothing
  - `python/ai_service.py` - Python anomaly detector using Isolation Forest
    - Classifies disasters: FIRE, TOO_MUCH_LIGHT, STORM, INTRUDER
    - Computes risk scores (0-100%)
    - Maintains temporal history for pattern detection

### `backend`

**fastapi_service/** - Real-time data gateway
- `app/main.py` - FastAPI application with WebSocket endpoints
- `app/mqtt_bridge.py` - Bridges MQTT messages to PostgreSQL and WebSocket clients
- `app/ws_manager.py` - WebSocket connection manager with message broadcasting
- `app/models.py` - SQLAlchemy ORM models for sensor_readings table
- `app/config.py` - Environment-based configuration
- `app/database.py` - Async SQLAlchemy session factory

**django_service/** - REST API and admin interface
- `sensors/models.py` - Django ORM models (SensorReading, Alarm)
- `sensors/views.py` - REST endpoints for historical data queries
- `sensors/serializers.py` - Request/response serialization
- `aura_backend/settings.py` - Django configuration

**mosquitto/** - MQTT broker configuration

### `mjolnir-city-react`
React frontend dashboard with Viking-themed UI:

- **src/components/**
  - `layout/` - Page structure (TopBar)
  - `tabs/SensorsTab.jsx` - Live sensor cards
  - `tabs/ChartsTab.jsx` - Time-series visualization
  - `tabs/MapTab.jsx` - Geographic sensor mapping
  - `cards/` - Card components for individual sensors
  - `charts/` - Chart.js integration with custom theme
  - `common/SectionTabs.jsx` - Tab navigation
  - `common/AlertTicker.jsx` - Continuous alert notifications
  - `panels/PageHeader.jsx` - Header with KPI display

- **src/context/SensorsContext.jsx** - Global state management for sensor data
- **src/hooks/** - Custom React hooks for WebSocket and data fetching
- **src/styles/** - CSS/styling
- **src/config/thresholds.js** - Alert thresholds and severity levels
- **src/utils/thresholdCheck.js** - Frost and anomaly classification

### `mbedd`
Embedded C application (nRF54L15 DK Bluetooth peripheral implementation):
- `src/main.c` - Zephyr RTOS-based BLE peripheral firmware

## Data Flow

1. **BLE Collection**: BLE Collector connects to devices (e.g., "AmuletMlotThora")
2. **MQTT Raw**: Sensor values (temp, humidity, light, distance, pressure) published to `sensors/raw`
3. **Filtering**: Julia application smooths raw data via Kalman filter -> `sensors/filtered`
4. **AI Analysis**: Python service analyzes filtered data using IsolationForest
   - Computes anomaly score (0-100%)
   - Classifies disaster type from archetypes
   - Publishes result to `sensors/final`
5. **DB Persistence**: FastAPI MQTT Bridge stores complete readings to PostgreSQL
6. **WebSocket Broadcast**: Real-time message distribution to all connected React clients
7. **UI Display**: Dashboard renders live metrics, charts, alerts

## Core Services

### FastAPI Gateway (`backend/fastapi_service`)
- **Endpoint**: `/ws/sensors/stream` (WebSocket)
  - Clients receive `history_backfill` message with last N data points on connect
  - Subsequently receive `sensor_update` messages in real time
- **Health Check**: `GET /health` - returns connection count and buffer size
- **Features**:
  - Async MQTT bridge running in background thread
  - Ring buffer (default 300 points) for new client backfill
  - CORS enabled for frontend development
  - Automatic database persistence

### Python AI Anomaly Detector
- **Model**: Isolation Forest (contamination=0.15, n_estimators=100)
- **Calibration**: Requires 30+ historical points before active detection
- **Risk Levels**: LOW (< 30%), MEDIUM (30-65%), HIGH (> 65%)
- **Archetype Classification**:
  - FIRE: High temp/humidity, high light, normal pressure
  - TOO_MUCH_LIGHT: Extreme light levels
  - STORM: Low humidity, pressure drop, variable conditions
  - INTRUDER: Very close distance + moderate activity

### React Frontend
- **App Component**: Multi-tab interface with active tab state
- **Frost Classification**: Determines critical styling (frost != OPTIMAL)
- **Real-time Updates**: WebSocket context provides live sensor state
- **Performance**: Chart.js with custom theme for historical data visualization
- **Responsive Design**: Adapts to viewport with Viking aesthetic

## Configuration

### Environment Variables

**FastAPI Service**:
```bash
MQTT_BROKER=mosquitto          # MQTT broker hostname
MQTT_PORT=1883                 # MQTT port
MQTT_TOPICS=mlottora/data      # Comma-separated topics to subscribe
DATABASE_URL=postgresql+asyncpg://...
LIVE_BUFFER_SIZE=300           # Historical points for new WebSocket clients
```

**Django Service**:
```bash
DJANGO_SECRET_KEY=...
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1
DB_NAME=aura_db
DB_USER=aura
DB_PASSWORD=aura_pass
DB_HOST=postgres
DB_PORT=5432
```

**BLE Gateway**:
```bash
BLE_DEVICE_NAME=AmuletMlotThora
BLE_CHAR_UUID=87654321-4321-8765-4321-876543218765
MQTT_BROKER=127.0.0.1
MQTT_PORT=11883
MQTT_TOPIC=nrf54/data
```

## Data Model

### SensorReading Table

| Field | Type | Purpose |
|-------|------|---------|
| id | BigInt | Primary key |
| device | String | Sensor device identifier |
| timestamp | DateTime | Measurement time (UTC) |
| node | String | Processing node/engine that analyzed this reading |
| raw_temp, raw_humidity, raw_light, raw_dist | Float | Layer 1: Raw sensor values |
| flt_temp, flt_humidity, flt_light, flt_dist | Float | Layer 2: Kalman-filtered values |
| risk_eval | String | Risk level (LOW/MEDIUM/HIGH) |
| risk_score | Float | Numeric risk percentage (0-100) |
| raw_payload | JSONB | Full MQTT message for auditing |
| created_at | DateTime | Record creation timestamp |

### Alarm Table

| Field | Type | Purpose |
|-------|------|---------|
| id | BigInt | Primary key |
| device | String | Device that triggered alarm |
| alarm_type | String | Type of alarm (e.g., "FIRE_DETECTED", "THRESHOLD_EXCEEDED") |
| message | Text | Human-readable alarm message |
| severity | String | CRITICAL/WARN/INFO |
| acknowledged | Boolean | Admin acknowledgment status |
| created_at | DateTime | When alarm was raised |

## WebSocket Message Format

### Client Connection
```json
{
  "type": "history_backfill",
  "points": [
    {
      "type": "sensor_update",
      "device": "MockAmulet_01",
      "ts": "2024-04-23T10:30:45.123Z",
      "raw": {"temp": 23.5, "humidity": 45.2, "light": 450, "dist": 200.0},
      "filtered": {"temp": 23.4, "humidity": 45.3, "light": 448, "dist": 199.5},
      "risk": {"eval": "LOW", "score": 15.2}
    }
  ]
}
```

### Real-time Updates
```json
{
  "type": "sensor_update",
  "device": "MockAmulet_01",
  "ts": "2024-04-23T10:30:48.456Z",
  "raw": {"temp": 23.6, "humidity": 45.1, "light": 455, "dist": 201.5},
  "filtered": {"temp": 23.5, "humidity": 45.2, "light": 451, "dist": 200.8},
  "risk": {"eval": "LOW", "score": 16.8}
}
```

## API Endpoints (Django REST)

### GET /api/sensors/readings/
List sensor readings with pagination:
```bash
curl "http://localhost:8001/api/sensors/readings/?device=MockAmulet_01&limit=100&offset=0"
```

### GET /api/sensors/readings/{id}/
Retrieve specific reading

### GET /api/sensors/alarms/
List all alarms with filtering

### POST /api/sensors/alarms/acknowledge/
Mark alarm as acknowledged

## Development

### Testing Edge Pipeline
1. Run mock sensors: `python mock_sensors.py`
2. Monitor MQTT topics: `mosquitto_sub -h localhost -p 11883 -t 'sensors/#'`
3. Check AI output: `mosquitto_sub -h localhost -p 11883 -t 'sensors/final'`

### React Development
- Frontend runs on Vite dev server (port 5173)
- HMR (Hot Module Replacement) enabled
- CORS proxy to backend (port 8000)

### Python Testing
```bash
# Test AI anomaly detector in isolation
python -m pytest tests/
```

## Performance Considerations

1. **MQTT Buffering**: Ring buffer (300 points default) minimizes database queries for new clients
2. **SQLAlchemy Async**: Non-blocking database operations allow high concurrency
3. **Kalman Filtering**: Reduces sensor noise and improves anomaly detection accuracy
4. **Isolation Forest**: Efficient anomaly detection with O(N log N) complexity
5. **WebSocket Broadcasting**: Async message distribution to all connected clients

## Security Notes

1. MQTT broker configured with `allow_anonymous true` for development only
2. Django SECRET_KEY should be set in production
3. CORS is set to allow all origins for development
4. VPN tunnel can be used for secure device-to-cloud communication
5. PostgreSQL credentials should be rotated in production

## Troubleshooting

**MQTT Connection Failed**
- Verify Mosquitto is running: `docker ps | grep mosquitto`
- Check port: `netstat -an | grep 11883` (edge) or `1883` (production)

**No Data Flowing**
- Check BLE device is broadcasting: `bluetoothctl scan on`
- Verify MQTT topics: `mosquitto_sub -h localhost -p 11883 -t '#'`
- Check AI service logs: `docker logs julia_filter` and `docker logs ai_service`

**WebSocket Connection Refused**
- FastAPI service running? `curl http://localhost:8000/health`
- Firewall blocking port 8000?
- CORS issue? Check browser console

**Database Locked**
- Restart PostgreSQL container: `docker-compose restart postgres`
- Check for stale connections in logs

## Technology Stack

- **Backend**: FastAPI, Django REST Framework, SQLAlchemy, AsyncPG
- **Message Queue**: Apache Mosquitto (MQTT)
- **Database**: PostgreSQL with async support
- **Data Processing**: Julia (Kalman filtering), scikit-learn (Isolation Forest)
- **Frontend**: React 18, Chart.js, Vite
- **Embedded**: Zephyr RTOS (nRF54L15)
- **Protocols**: BLE, MQTT, WebSocket, REST
- **Infrastructure**: Docker, Docker Compose
- **Language**: Python, JavaScript/JSX, C, Julia

## License

Project AURA - Internal Project

## Contact

For questions or issues, refer to project documentation and test logs.

---

**Project Status**: Finished Product

**Last Updated**: April 2026
