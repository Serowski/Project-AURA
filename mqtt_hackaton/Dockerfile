FROM python:3.12-slim

WORKDIR /app

ENV PYTHONUNBUFFERED=1
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY mqtt.py subscriber.py publisher.py ./

# Domyślna komenda — nadpisywana przez docker-compose (command:)
CMD ["python", "subscriber.py"]
