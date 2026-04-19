"""
SQLAlchemy ORM model for sensor_readings table.
Table is created by init_db.sql — we only map to it here.
"""

from sqlalchemy import Column, BigInteger, String, Float, DateTime, func
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    device = Column(String(64), nullable=False)
    timestamp = Column(DateTime(timezone=True), nullable=False)
    node = Column(String(64))

    # Layer 1: RAW
    raw_temp = Column(Float)
    raw_humidity = Column(Float)
    raw_light = Column(Float)
    raw_dist = Column(Float)

    # Layer 2: Kalman-filtered
    flt_temp = Column(Float)
    flt_humidity = Column(Float)
    flt_light = Column(Float)
    flt_dist = Column(Float)

    # Layer 3: AI risk
    risk_eval = Column(String(16))
    risk_score = Column(Float)

    # Meta
    raw_payload = Column(JSONB)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    def __repr__(self):
        return f"<SensorReading {self.device} @ {self.timestamp}>"
