"""
MQTT Subscriber — nasłuchuje wiadomości na topicach nrf54/data i mlottora/data.
Dekoduje surowe dane hex na czytelny tekst.
"""

import json
import os
import random
import struct

import paho.mqtt.client as mqtt

# ── Konfiguracja z ENV ────────────────────────────────────────
BROKER = os.getenv("MQTT_BROKER", "localhost")
PORT = int(os.getenv("MQTT_PORT", 1883))
# Subskrybujemy oba topiki — wildcard łapie wszystko
TOPICS = os.getenv("MQTT_TOPICS", "nrf54/data,mlottora/data,mlottora/final,mlottora/raw").split(",")
CLIENT_ID = os.getenv("MQTT_CLIENT_ID", f"subscriber-{random.randint(1000, 9999)}")


def dekoduj_payload(raw: bytes) -> str:
    """Próbuje zdekodować surowe bajty na czytelny tekst."""

    # 1. Spróbuj odczytać payload jako tekst ASCII
    try:
        tekst_ascii = raw.decode("utf-8").strip()
    except UnicodeDecodeError:
        tekst_ascii = None

    # 2. Jeśli payload to hex string (znaki 0-9, a-f, A-F) → zdekoduj na tekst
    if tekst_ascii:
        wyczyszczony = tekst_ascii.replace(" ", "").replace("-", "").replace(":", "")
        if len(wyczyszczony) >= 2 and all(c in "0123456789abcdefABCDEF" for c in wyczyszczony):
            try:
                zdekodowane_bajty = bytes.fromhex(wyczyszczony)
                # Spróbuj odczytać zdekodowane bajty jako tekst
                try:
                    zdekodowany_tekst = zdekodowane_bajty.decode("utf-8")
                    if zdekodowany_tekst.isprintable() or zdekodowany_tekst.strip().isprintable():
                        return f"HEX→TEKST: \"{zdekodowany_tekst}\""
                except UnicodeDecodeError:
                    pass
                # Jeśli nie tekst — pokaż zdekodowane bajty
                hex_pretty = " ".join(f"{b:02x}" for b in zdekodowane_bajty)
                return f"HEX→BAJTY: [{hex_pretty}] ({len(zdekodowane_bajty)} bajtów)"
            except ValueError:
                pass

    # 3. Jeśli payload to zwykły czytelny tekst
    if tekst_ascii and (tekst_ascii.isprintable() or tekst_ascii.strip().isprintable()):
        # Może to JSON?
        try:
            dane = json.loads(tekst_ascii)
            return f"JSON: {json.dumps(dane, ensure_ascii=False, indent=4)}"
        except (json.JSONDecodeError, ValueError):
            pass
        return f"TEKST: \"{tekst_ascii}\""

    # 4. Surowe bajty — parsowanie struct (nRF pakiety)
    dlugosc = len(raw)

    if dlugosc == 2:
        wartosc = struct.unpack("<h", raw)[0]
        return f"INT16: {wartosc}"

    if dlugosc == 4:
        jako_int = struct.unpack("<i", raw)[0]
        jako_float = struct.unpack("<f", raw)[0]
        return f"INT32: {jako_int} | FLOAT32: {jako_float:.4f}"

    # 5. Ogólna próba — tablica int16
    if dlugosc % 2 == 0 and dlugosc >= 4:
        wartosci = []
        for i in range(0, dlugosc, 2):
            val = struct.unpack("<h", raw[i:i+2])[0]
            wartosci.append(str(val))
        return f"INT16[]: [{', '.join(wartosci)}]"

    # 6. Fallback
    return f"BAJTY: {list(raw)}"


def on_connect(client, userdata, flags, reason_code, properties):
    if reason_code == 0:
        print(f"✅ Połączono z brokerem {BROKER}:{PORT}")
        for topic in TOPICS:
            topic = topic.strip()
            client.subscribe(topic, qos=1)
            print(f"👂 Subskrypcja na topic: {topic}")
    else:
        print(f"❌ Błąd połączenia: {reason_code}")


def on_message(client, userdata, msg):
    raw = msg.payload
    hex_pretty = " ".join(f"{b:02x}" for b in raw)
    dlugosc = len(raw)

    print(f"📥 [{msg.topic}] (QoS {msg.qos}) — {dlugosc} bajtów")
    print(f"    HEX:  {hex_pretty}")

    # Dekodowanie surowych danych
    wynik = dekoduj_payload(raw)
    for linia in wynik.split("\n"):
        print(f"    {linia}")

    print()


def on_disconnect(client, userdata, flags, reason_code, properties):
    print(f"⚠️  Rozłączono (kod: {reason_code}). Ponowne łączenie...")


def main():
    client = mqtt.Client(
        callback_api_version=mqtt.CallbackAPIVersion.VERSION2,
        client_id=CLIENT_ID,
    )
    client.on_connect = on_connect
    client.on_message = on_message
    client.on_disconnect = on_disconnect

    print(f"🔌 Łączenie z {BROKER}:{PORT}...")
    client.connect(BROKER, PORT, keepalive=60)

    try:
        client.loop_forever()
    except KeyboardInterrupt:
        print("\n🛑 Zatrzymano subscriber.")
    finally:
        client.disconnect()


if __name__ == "__main__":
    main()
