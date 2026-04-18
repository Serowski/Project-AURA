# Mjölnir City — Digital Longhall

Viking-themed real-time sensor dashboard for the Mjölnir City hackathon project.

## Stack

- **React 18** + **Vite** (frontend)
- **Chart.js** + `react-chartjs-2` (visualisations)
- Native Canvas API (heatmap + city map)
- Pure CSS with CSS variables (no Tailwind / styled-components — keeps the demo portable)

## Backend integration targets

| Concern                | Backend           | Endpoint (planned)              |
|------------------------|-------------------|---------------------------------|
| Sensor snapshot        | Django REST       | `GET /api/sensors/latest/`      |
| History (24h, …)       | Django REST       | `GET /api/history/<metric>/`    |
| Live stream (low-lat)  | FastAPI WebSocket | `wss://.../ws/sensors/stream`   |
| Alarms                 | FastAPI           | `POST /api/alarms/`             |
| Rune-log persistence   | Django            | `POST /api/runelog/`            |
| Guard summon action    | Django            | `POST /api/guard/summon`        |

All integration points are marked with `// TODO(backend): ...` comments in
the code — grep for them:

```bash
grep -rn "TODO(backend)" src/
```

## Run locally

```bash
npm install
npm run dev
```

## Project structure

```
src/
├── main.jsx                # React entry
├── App.jsx                 # Top-level layout + tab router
├── config/
│   └── thresholds.js       # Alarm/warning thresholds
├── data/
│   ├── mockSensors.js      # Mock data for demo (remove in production)
│   ├── initialRuneLog.js
│   └── wisdoms.js
├── services/
│   ├── api.js              # REST adapter (Django)
│   └── sensorStream.js     # WebSocket adapter (FastAPI)
├── context/
│   └── SensorsContext.jsx  # App-wide sensor state
├── hooks/
│   ├── useSensorSimulation.js
│   ├── useRuneLog.js
│   ├── useAlarms.js
│   └── useWisdomRotator.js
├── utils/
│   ├── fluctuate.js
│   ├── formatTime.js
│   └── thresholdCheck.js
├── styles/
│   ├── variables.css
│   └── index.css
└── components/
    ├── layout/   # TopBar, Sidebar
    ├── common/   # Badge, Panel, AlertTicker, SectionTabs, RunicCorner, icons
    ├── cards/    # MetricCard, SensorCard + 4 metric cards
    ├── panels/   # PageHeader, HeatmapPanel, RuneLogFeed, AtmosphericComposition, ForgeWisdom
    ├── charts/   # Chart.js wrappers + CityMap canvas
    └── tabs/     # SensorsTab, ChartsTab, MapTab
```
