import uuid
from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field, field_validator


class SiteCreate(BaseModel):
    project_id: uuid.UUID
    name: str = Field(min_length=2, max_length=255)
    site_code: str = Field(min_length=2, max_length=100)
    area_hectares: float = Field(ge=0)
    polygon_geojson: dict[str, Any]
    centroid_lat: float
    centroid_lng: float
    status: str = Field(default="active", max_length=50)

    @field_validator("polygon_geojson")
    @classmethod
    def validate_polygon_geojson(cls, value: dict[str, Any]) -> dict[str, Any]:
        if value.get("type") != "Polygon":
            raise ValueError("polygon_geojson must be a GeoJSON Polygon")

        coordinates = value.get("coordinates")
        if not isinstance(coordinates, list) or len(coordinates) == 0:
            raise ValueError("polygon_geojson.coordinates must be a non-empty list")

        first_ring = coordinates[0]
        if not isinstance(first_ring, list) or len(first_ring) < 4:
            raise ValueError("Polygon must have at least 4 coordinate pairs")

        first_point = first_ring[0]
        last_point = first_ring[-1]
        if first_point != last_point:
            raise ValueError("Polygon ring must be closed")

        return value


class SiteResponse(BaseModel):
    id: uuid.UUID
    project_id: uuid.UUID
    name: str
    site_code: str
    area_hectares: float
    polygon_geojson: dict[str, Any]
    centroid_lat: float
    centroid_lng: float
    status: str
    created_at: datetime

    model_config = {"from_attributes": True}