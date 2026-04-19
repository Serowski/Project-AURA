import asyncio
import logging
import sys
import argparse
import paho.mqtt.client as mqtt
from vpn_manager import VPNManager

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("vpn_uplink")

class VPNUplink:
    def __init__(self, remote_broker, remote_port, local_broker, local_port):
        self.remote_broker = remote_broker
        self.remote_port = remote_port
        self.local_broker = local_broker
        self.local_port = local_port
        
        self.local_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.remote_client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)

    def on_local_message(self, client, userdata, msg):
        local_topic = msg.topic
        remote_topic = "mlottora/unknown"
        
        if local_topic == "sensors/filtered":
            remote_topic = "mlottora/filtered"
        elif local_topic == "sensors/final":
            remote_topic = "mlottora/data"
        else:
            return 
            
        try:
            if self.remote_client.is_connected():
                self.remote_client.publish(remote_topic, msg.payload)
        except Exception as e:
            logger.error(f"Failed to forward message: {e}")

    async def run(self, ovpn_path):
        vpn = VPNManager(ovpn_path)
        
        if not await vpn.start():
            logger.error("VPN Failed.")
            return

        await asyncio.sleep(3)

        try:
            connected = False
            while not connected:
                try:
                    logger.info(f"Attempting to connect to REMOTE MQTT at {self.remote_broker}:{self.remote_port}...")
                    self.remote_client.connect(self.remote_broker, self.remote_port, 60)
                    self.remote_client.loop_start()
                    connected = True
                    logger.info("Successfully connected to REMOTE server!")
                except Exception as e:
                    logger.warning(f"Remote connection failed ({e}). Retrying in 5s...")
                    await asyncio.sleep(5)

            self.local_client.on_message = self.on_local_message
            logger.info(f"Connecting to LOCAL MQTT at {self.local_broker}:{self.local_port}...")
            self.local_client.connect(self.local_broker, self.local_port, 60)
            
            self.local_client.subscribe("sensors/#") 
            self.local_client.loop_start()

            logger.info("VPN Uplink is fully ACTIVE.")
            
            while True:
                await asyncio.sleep(1)

        except Exception as e:
            logger.exception(f"Fatal in Uplink: {e}")
        finally:
            self.local_client.disconnect()
            self.remote_client.disconnect()
            vpn.stop()

async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--ovpn", default="/etc/openvpn/Runner.ovpn")
    parser.add_argument("--remote-broker", default="10.0.0.19")
    parser.add_argument("--remote-port", type=int, default=1883)
    parser.add_argument("--local-broker", default="127.0.0.1")
    parser.add_argument("--local-port", type=int, default=11883)
    args = parser.parse_args()

    uplink = VPNUplink(
        args.remote_broker, args.remote_port,
        args.local_broker, args.local_port
    )
    
    await uplink.run(args.ovpn)

if __name__ == "__main__":
    asyncio.run(main())
