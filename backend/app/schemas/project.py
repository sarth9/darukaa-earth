import uuid
from datetime import datetime

from pydantic import BaseModel, Field


class ProjectCreate(BaseModel):
    name: str = Field(min_length=2, max_length=255)
    description: str | None = None
    region: str | None = Field(default=None, max_length=255)


class ProjectResponse(BaseModel):
    id: uuid.UUID
    name: str
    description: str | None
    region: str | None
    created_by: uuid.UUID
    created_at: datetime

    model_config = {"from_attributes": True}