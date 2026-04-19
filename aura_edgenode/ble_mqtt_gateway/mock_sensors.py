import paho.mqtt.client as mqtt
import json
import time
import random

BROKER = "127.0.0.1"
PORT = 11883
TOPIC = "sensors/raw"

client = mqtt.Client()

def generate_mock_data():
    t = time.time()
    
    temp, hum, light, dist, press = 23.0, 45.0, 400, 200.0, 1013.0
    
    scenario = random.random()
    if scenario < 0.05:
        temp, light, hum = random.uniform(80, 150), random.randint(1500, 3000), random.uniform(0, 10)
    elif scenario < 0.10:
        light = random.randint(4000, 8000)
    elif scenario < 0.15:
        dist = random.uniform(1, 15)
    elif scenario < 0.20:
        hum, press, light = random.uniform(90, 100), 980, random.randint(0, 50)
    else:
        temp += random.uniform(-2, 2)
        hum += random.uniform(-5, 5)
        light += random.randint(-50, 50)
        dist += random.uniform(-20, 20)
        press += random.uniform(-2, 2)

    return {
        "ts": t, "device": "MockAmulet_01",
        "data": {"light": int(light), "humidity": round(hum, 2), "temp": round(temp, 2), "dist": round(dist, 2), "pressure": round(press, 2)}
    }

if __name__ == "__main__":
    try:
        client.connect(BROKER, PORT)
        while True:
            client.publish(TOPIC, json.dumps(generate_mock_data()))
            time.sleep(3.0)
    except: pass
