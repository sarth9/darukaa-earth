import uuid
from datetime import date, datetime

from pydantic import BaseModel, Field


class SiteAnalyticsCreate(BaseModel):
    site_id: uuid.UUID
    observed_on: date
    carbon_score: float = Field(ge=0)
    biodiversity_score: float = Field(ge=0)
    vegetation_index: float = Field(ge=0)
    soil_health_index: float = Field(ge=0)
    notes: str | None = None


class SiteAnalyticsResponse(BaseModel):
    id: uuid.UUID
    site_id: uuid.UUID
    observed_on: date
    carbon_score: float
    biodiversity_score: float
    vegetation_index: float
    soil_health_index: float
    notes: str | None
    created_at: datetime

    model_config = {"from_attributes": True}