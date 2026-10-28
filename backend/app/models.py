from typing import Optional, List, Dict
from pydantic import BaseModel, Field, field_validator


class ReportCreate(BaseModel):
    latitude: float = Field(..., description="Latitude between -90 and 90")
    longitude: float = Field(..., description="Longitude between -180 and 180")
    sensor_score: float = Field(..., ge=0.0, description="Sensor magnitude / jolt severity score")
    gps_accuracy: Optional[float] = Field(None, ge=0.0, description="GPS accuracy in meters")
    source: str = Field(..., description="'sensor' or 'simulated'")
    is_demo: bool = Field(False, description="Whether this report was triggered by demo simulation")
    notes: Optional[str] = Field(None, max_length=500)
    severity_estimate: Optional[str] = Field(None, description="'low', 'medium', or 'high'")

    @field_validator("latitude")
    @classmethod
    def validate_latitude(cls, v: float) -> float:
        if not (-90.0 <= v <= 90.0):
            raise ValueError("Latitude must be between -90 and 90 degrees")
        return v

    @field_validator("longitude")
    @classmethod
    def validate_longitude(cls, v: float) -> float:
        if not (-180.0 <= v <= 180.0):
            raise ValueError("Longitude must be between -180 and 180 degrees")
        return v

    @field_validator("source")
    @classmethod
    def validate_source(cls, v: str) -> str:
        clean = v.strip().lower()
        if clean not in ["sensor", "simulated", "manual"]:
            raise ValueError("Source must be 'sensor' or 'simulated'")
        return clean


class ReportUpdate(BaseModel):
    status: Optional[str] = Field(None, description="'new', 'under_review', 'inspection_scheduled', 'resolved'")
    notes: Optional[str] = Field(None, max_length=500)
    severity_estimate: Optional[str] = Field(None, description="'low', 'medium', or 'high'")

    @field_validator("status")
    @classmethod
    def validate_status(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            clean = v.strip().lower()
            allowed = ["new", "under_review", "inspection_scheduled", "resolved"]
            if clean not in allowed:
                raise ValueError(f"Status must be one of {allowed}")
            return clean
        return v


class ReportResponse(BaseModel):
    id: str
    latitude: float
    longitude: float
    timestamp: str
    sensor_score: float
    gps_accuracy: Optional[float] = None
    source: str
    is_demo: bool
    status: str
    severity_estimate: str
    notes: Optional[str] = None


class HotspotResponse(BaseModel):
    id: str
    center_latitude: float
    center_longitude: float
    report_count: int
    radius_meters: float
    avg_sensor_score: float
    severity_estimate: str
    report_ids: List[str]
    status_summary: Dict[str, int]
    is_demo: bool


class StatsResponse(BaseModel):
    total_reports: int
    reports_24h: int
    high_priority_count: int
    resolved_count: int
    hotspot_count: int
    status_counts: Dict[str, int]
    severity_counts: Dict[str, int]
    demo_count: int
    real_count: int


class DemoDeleteResponse(BaseModel):
    message: str
    deleted_count: int

