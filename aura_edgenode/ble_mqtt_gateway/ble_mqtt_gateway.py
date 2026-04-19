import asyncio
import logging
import signal
import subprocess
import os
import sys
import argparse
from bleak import BleakClient, BleakScanner
import paho.mqtt.client as mqtt

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("gateway")

class VPNManager:
    def __init__(self, config_path):
        self.config_path = config_path
        self.process = None

    async def start(self):
        logger.info(f"Starting OpenVPN with config: {self.config_path}")
        cmd = ["openvpn", "--config", self.config_path, "--pull-filter", "ignore", "redirect-gateway"]
        
        try:
            self.process = subprocess.Popen(
                cmd, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, preexec_fn=os.setsid
            )
        except Exception as e:
            logger.error(f"Failed to start OpenVPN: {e}")
            return False

        logger.info("Waiting for VPN to establish...")
        for line in iter(self.process.stdout.readline, ""):
            logger.info(f"VPN: {line.strip()}")
            if "Initialization Sequence Completed" in line:
                logger.info("VPN connection established. Adding route...")
                await asyncio.sleep(2) 
                subprocess.run(["ip", "route", "add", "10.0.0.0/24", "dev", "tun0"], check=False)
                return True
            if self.process.poll() is not None:
                return False
        return False

    def stop(self):
        if self.process:
            logger.info("Stopping OpenVPN...")
            try:
                os.killpg(os.getpgid(self.process.pid), signal.SIGTERM)
                self.process.wait(timeout=5)
            except: pass

class MQTTForwarder:
    def __init__(self, broker, port, topic):
        self.broker = broker
        self.port = port
        self.topic = topic
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    def connect(self):
        logger.info(f"Connecting to MQTT at {self.broker}:{self.port}...")
        try:
            self.client.connect(self.broker, self.port, 60)
            self.client.loop_start()
            logger.info("Connected to MQTT broker.")
            return True
        except Exception as e:
            logger.warning(f"MQTT connection failed ({e}). Continuing anyway.")
            return True

    def publish(self, payload):
        logger.info(f"BLE -> {payload.hex()}")
        self.client.publish(self.topic, payload)

class BLEManager:
    def __init__(self, target_name, char_uuid, callback):
        self.target_name = target_name
        self.char_uuid = char_uuid
        self.callback = callback

    async def run(self):
        while True:
            try:
                logger.info(f"Scanning for BLE device: {self.target_name}...")
                device = await BleakScanner.find_device_by_filter(
                    lambda d, ad: d.name and self.target_name in d.name, timeout=10.0
                )
                if not device:
                    await asyncio.sleep(5)
                    continue

                logger.info(f"Connecting to {device.address}...")
                async with BleakClient(device.address, timeout=20.0) as client:
                    logger.info("Connected to BLE device.")
                    await client.start_notify(self.char_uuid, lambda s, d: self.callback(d))
                    while client.is_connected:
                        await asyncio.sleep(1)
                    logger.warning("BLE disconnected.")
            except Exception as e:
                logger.error(f"BLE Error: {e}")
                await asyncio.sleep(5)

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ovpn", default="/etc/openvpn/Runner.ovpn")
    parser.add_argument("--name", default="AmuletMlotThora")
    parser.add_argument("--uuid", default="87654321-4321-8765-4321-876543218765")
    parser.add_argument("--broker", default="10.0.0.19")
    parser.add_argument("--port", type=int, default=1883)
    parser.add_argument("--topic", default="nrf54/data")
    args = parser.parse_args()

    vpn = VPNManager(args.ovpn)
    mqtt_client = MQTTForwarder(args.broker, args.port, args.topic)
    ble = BLEManager(args.name, args.uuid, mqtt_client.publish)

    stop_event = asyncio.Event()
    loop = asyncio.get_running_loop()
    for sig in (signal.SIGINT, signal.SIGTERM):
        loop.add_signal_handler(sig, stop_event.set)

    try:
        if not await vpn.start():
            logger.error("VPN Failed.")
            return

        mqtt_client.connect()

        ble_task = asyncio.create_task(ble.run())

        logger.info("Gateway is RUNNING.")
        await stop_event.wait()
        ble_task.cancel()

    except Exception as e:
        logger.exception(f"Fatal: {e}")
    finally:
        mqtt_client.client.disconnect()
        vpn.stop()

if __name__ == "__main__":
    asyncio.run(main())
