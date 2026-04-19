import asyncio
import logging
import sys
import argparse
import json
import time
from bleak import BleakClient, BleakScanner
import paho.mqtt.client as mqtt

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("ble_collector")

class BLECollector:
    def __init__(self, target_name, char_uuid, local_broker, local_port):
        self.target_name = target_name
        self.char_uuid = char_uuid
        self.mqtt_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.local_broker = local_broker
        self.local_port = local_port

    def on_ble_data(self, data):
        try:
            # Dekodowanie ramki: "dist;light;temp"
            raw_str = data.decode('utf-8').strip()
            parts = raw_str.split(';')
            
            dist_val = float(parts[0]) if len(parts) > 0 else 0.0
            light_val = float(parts[1]) if len(parts) > 1 else 0.0
            temp_val = float(parts[2]) if len(parts) > 2 else 0.0
            
            payload = {
                "ts": time.time(),
                "device": self.target_name,
                "data": {
                    "dist": dist_val,
                    "light": light_val,
                    "temp": temp_val,
                    "humidity": 0.0,
                    "pressure": 0.0
                }
            }
            
            # CLEAR DEBUG VISUALIZATION
            print("\n" + "#"*50, flush=True)
            print(f" REAL BLE DATA RECEIVED {' '*19}  ", flush=True)
            print(f" DISTANCE: {dist_val:8.2f} cm {' '*19}  ", flush=True)
            print(f" LIGHT:    {light_val:8.2f} lux {' '*19}  ", flush=True)
            print(f" TEMPERATURE:{temp_val:8.2f} °C {' '*19}  ", flush=True)
            print("#"*50 + "\n", flush=True)
            
            self.mqtt_client.publish("sensors/raw", json.dumps(payload))
        except Exception as e:
            logger.error(f"Parse error: {e} | Raw string: {data.decode('utf-8', errors='ignore')}")

    async def run(self):
        logger.info(f"Connecting to LOCAL MQTT at {self.local_broker}:{self.local_port}...")
        self.mqtt_client.connect(self.local_broker, self.local_port, 60)
        self.mqtt_client.loop_start()

        while True:
            try:
                logger.info(f"Scanning for BLE: {self.target_name}...")
                device = await BleakScanner.find_device_by_filter(
                    lambda d, ad: d.name and self.target_name in d.name, timeout=10.0
                )
                if not device:
                    await asyncio.sleep(5)
                    continue

                async with BleakClient(device.address, timeout=20.0) as client:
                    logger.info("Connected to Amulet.")
                    await client.start_notify(self.char_uuid, lambda s, d: self.on_ble_data(d))
                    while client.is_connected:
                        await asyncio.sleep(1)
            except Exception as e:
                logger.error(f"BLE Error: {e}")
                await asyncio.sleep(5)

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--name", default="AmuletMlotThora")
    parser.add_argument("--uuid", default="87654321-4321-8765-4321-876543218765")
    parser.add_argument("--broker", default="localhost")
    parser.add_argument("--port", type=int, default=11883)
    args = parser.parse_args()
    await BLECollector(args.name, args.uuid, args.broker, args.port).run()

if __name__ == "__main__":
    asyncio.run(main())
