from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


ToolName = Literal["nmap", "nikto", "sqlmap", "trivy"]
TargetType = Literal["host", "url", "filesystem", "image"]


class TargetInput(BaseModel):
    type: TargetType
    value: str = Field(min_length=1, max_length=255)


class ScanCreate(BaseModel):
    name: str = Field(min_length=3, max_length=120)
    tools: list[ToolName] = Field(min_length=1)
    targets: list[TargetInput] = Field(min_length=1)


class JobResponse(BaseModel):
    id: int
    name: str
    status: str
    created_at: datetime
    updated_at: datetime
    error_message: str | None

    class Config:
        from_attributes = True


class FindingResponse(BaseModel):
    id: int
    tool: str
    target: str
    severity: str
    title: str
    evidence: str
    artifact_path: str | None
    created_at: datetime

    class Config:
        from_attributes = True
