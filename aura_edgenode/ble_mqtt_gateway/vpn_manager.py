import subprocess
import os
import signal
import logging
import asyncio

logger = logging.getLogger("vpn_manager")

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
