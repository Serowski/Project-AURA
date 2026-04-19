FROM python:3.14-slim

RUN apt-get update && apt-get install -y \
    openvpn \
    iproute2 \
    bluez \
    libdbus-1-3 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY vpn_manager.py .
COPY ble_collector.py .
COPY vpn_uplink.py .
COPY mock_sensors.py .

CMD ["python", "ble_collector.py"]
