import paho.mqtt.client as mqtt
import json
import time
import pandas as pd
import numpy as np
from sklearn.ensemble import IsolationForest
import logging

logging.basicConfig(level=logging.INFO, format="%(asctime)s [AI_MODEL] %(message)s")
logger = logging.getLogger("ai_service")

class AIAnomalyDetector:
    def __init__(self, broker="127.0.0.1", port=11883):
        self.client = mqtt.Client(mqtt.CallbackAPIVersion.VERSION2)
        self.broker = broker
        self.port = port
        self.model = IsolationForest(contamination=0.15, n_estimators=100)
        self.history = []
        self.is_model_ready = False
        self.weights = np.array([1.0, 1.0, 0.01, 1.0, 1.0])
        self.archetypes = {
            "FIRE":           np.array([200, 80, 2500, 10, 980]),
            "TOO_MUCH_LIGHT": np.array([200, 25, 3000, 45, 1013]),
            "STORM":          np.array([200, 15, 100,  95, 970]),
            "INTRUDER":       np.array([5,   22, 600,  50, 1013])
        }

    def classify_disaster(self, v):
        best_match = "ANOMALY"
        min_dist = float('inf')
        for name, profile in self.archetypes.items():
            dist = np.linalg.norm((v - profile) * self.weights)
            if dist < min_dist:
                min_dist = dist
                best_match = name
        return best_match

    def predict_risk(self, d):
        v = np.array([
            float(d.get('dist', 0)), 
            float(d.get('temp', 0)), 
            float(d.get('light', 0)), 
            float(d.get('humidity', 0)), 
            float(d.get('pressure', 0))
        ])
        self.history.append(v)
        
        if len(self.history) > 30:
            self.history.pop(0)
            self.is_model_ready = True
            
        if not self.is_model_ready:
            return 0.0, "LOW", "CALIBRATING", "NONE"
            
        if len(self.history) % 5 == 0:
            self.model.fit(np.array(self.history))
            
        try:
            score = self.model.decision_function([v])[0]
            risk = round(max(0.0, min(100.0, (0.15 - score) * 200)), 1)
        except:
            risk = 0.0
    
        if risk < 30: lvl = "LOW"
        elif risk < 65: lvl = "MEDIUM"
        else: lvl = "HIGH"
        
        disaster = self.classify_disaster(v) if risk > 30 else "NONE"
        return risk, lvl, "ACTIVE", disaster

    def on_message(self, client, userdata, msg):
        try:
            p = json.loads(msg.payload)
            d = p.get('filtered', {})
            
            risk_pct, risk_lvl, stat, dis = self.predict_risk(d)

            final = {
                "ts": p.get('ts', time.time()),
                "device": p.get('device', 'unknown'),
                "metrics": d,  
                "analysis": {
                    "risk_percent": f"{risk_pct}%",
                    "risk_level": risk_lvl,
                    "status": stat,
                    "disaster_type": dis,
                    "engine": "v5.1_fixed_output"
                }
            }
            self.client.publish("sensors/final", json.dumps(final))
            
        except Exception as e:
            logger.error(f"AI Error: {e}")

    def run(self):
        self.client.on_message = self.on_message
        self.client.connect(self.broker, self.port, 60)
        self.client.subscribe("sensors/filtered")
        logger.info("AI Service with fixed metrics output started.")
        self.client.loop_forever()

if __name__ == "__main__":
    AIAnomalyDetector().run()
