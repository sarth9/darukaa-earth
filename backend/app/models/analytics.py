import uuid
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Float, ForeignKey, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base


class SiteAnalytics(Base):
    __tablename__ = "site_analytics"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    site_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("sites.id"), nullable=False)
    observed_on: Mapped[date] = mapped_column(Date, nullable=False)
    carbon_score: Mapped[float] = mapped_column(Float, nullable=False)
    biodiversity_score: Mapped[float] = mapped_column(Float, nullable=False)
    vegetation_index: Mapped[float] = mapped_column(Float, nullable=False)
    soil_health_index: Mapped[float] = mapped_column(Float, nullable=False)
    notes: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    site = relationship("Site", back_populates="analytics")