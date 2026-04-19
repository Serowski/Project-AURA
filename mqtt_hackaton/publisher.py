"""
MQTT Publisher — symuluje sensor (3 równoległe topic'i).
Wysyła dane JSON osobno na temat surowy, kalmana i sztucznej inteligencji.
"""

import json
import os
import random
import time
from datetime import datetime, timezone

import paho.mqtt.client as mqtt

BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", 1883))
INTERVAL = int(os.getenv("PUBLISH_INTERVAL", 3))
CLIENT_ID = os.getenv("MQTT_CLIENT_ID", f"publisher-{random.randint(1000, 9999)}")


def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print(f"✅ Połączono z brokerem {BROKER}:{PORT}")
    else:
        print(f"❌ Błąd połączenia: {reason_code}")


def on_disconnect(client, userdata, flags, reason_code, properties):
    print(f"⚠️  Rozłączono (kod: {reason_code}). Ponowne łączenie...")


def generate_messages() -> dict:
    """Generuje komplet 3 oddzielnych wiadomości pod ten sam ułamek timestampu."""
    ts = datetime.now(timezone.utc).timestamp()
    device = "MockAmulet_01"
    
    temp = round(random.uniform(18.0, 35.0), 2)
    humidity = round(random.uniform(30.0, 80.0), 2)
    light = round(random.uniform(200.0, 800.0), 2)
    dist = round(random.uniform(50.0, 200.0), 2)
    
    raw = {
        "ts": ts,
        "device": device,
        "metrics": {
            "temp": temp,
            "humidity": humidity,
            "light": light,
            "dist": dist
        }
    }
    
    filtered = {
        "ts": ts,
        "device": device,
        "metrics": {
            "temp": round(temp - random.uniform(-0.5, 0.5), 2),
            "humidity": round(humidity - random.uniform(-1.0, 1.0), 2),
            "light": round(light - random.uniform(-10.0, 10.0), 2),
            "dist": round(dist - random.uniform(-2.0, 2.0), 2)
        }
    }
    
    risk_value = random.uniform(0.0, 100.0)
    if risk_value > 80:
        status, level = "CRITICAL", "HIGH"
    elif risk_value > 50:
        status, level = "WARNING", "MEDIUM"
    else:
        status, level = "OK", "LOW"
        
    final = {
        "ts": ts,
        "device": device,
        "metrics": filtered["metrics"],
        "analysis": {
            "risk_percent": f"{round(risk_value, 1)}%",
            "risk_level": level,
            "status": status,
            "disaster": "NONE" if risk_value < 80 else "INTRUDER",
            "engine": "weighted_vector_v5"
        }
    }
    
    return {
        "mlottora/raw": raw,
        "mlottora/filtered": filtered,
        "mlottora/final": final
    }


def main():
    client = mqtt.Client(
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        client_id=CLIENT_ID,
    )
    client.on_connect = on_connect
    client.on_disconnect = on_disconnect

    print(f"🔌 Łączenie testowego multi-publishera z {BROKER}:{PORT}...")
    client.connect(BROKER, PORT, keepalive=60)
    client.loop_start()

    try:
        while True:
            messages = generate_messages()
            # Wysyłanie 3 rozdzielonych wiadomości naraz
            for topic, payload in messages.items():
                message = json.dumps(payload, ensure_ascii=False)
                result = client.publish(topic, message, qos=1)

                if result.rc == mqtt.MQTT_ERR_SUCCESS:
                    # Skrócony print, aby konsola była czytelna
                    print(f"📤 [{topic}] → {message[:65]}...")
                else:
                    print(f"❌ Błąd publikacji na {topic}: {result.rc}")

            print("---")
            time.sleep(INTERVAL)

    except KeyboardInterrupt:
        print("\n🛑 Zatrzymano publisher.")
    finally:
        client.loop_stop()
        client.disconnect()


if __name__ == "__main__":
    main()
