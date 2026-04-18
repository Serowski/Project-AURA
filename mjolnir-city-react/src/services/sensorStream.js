/**
 * WebSocket adapter for the live sensor stream (FastAPI).
 *
 * This is currently NOT used (the demo uses useSensorSimulation),
 * but the shape is ready so the context can swap it in by changing
 * a single line.
 *
 * TODO(backend): wire this into SensorsContext once the FastAPI
 * endpoint is available.
 */

const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
const defaultWsUrl = `${protocol}//${window.location.host}/ws/sensors/stream`;
const WS_URL = import.meta.env.VITE_SENSORS_WS_URL || defaultWsUrl;

export function openSensorStream({ onMessage, onError, onClose } = {}) {
  const ws = new WebSocket(WS_URL);

  ws.addEventListener('message', (evt) => {
    try {
      const data = JSON.parse(evt.data);
      onMessage?.(data);
    } catch (err) {
      onError?.(err);
    }
  });

  ws.addEventListener('error', (err) => onError?.(err));
  ws.addEventListener('close', (evt) => onClose?.(evt));

  return {
    close: () => ws.close(),
    send:  (payload) => ws.send(JSON.stringify(payload)),
  };
}
