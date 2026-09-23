from datetime import datetime

from pydantic import BaseModel, Field


class ArcAsset(BaseModel):
    file_name: str = Field(min_length=1, max_length=255)
    original_name: str = Field(min_length=1, max_length=255)
    content_type: str = Field(min_length=1, max_length=100)
    size: int = Field(ge=1)
    url: str = Field(min_length=1, max_length=2_000)


class ArcRowCreate(BaseModel):
    title: str = Field(default="Untitled Arc", min_length=1, max_length=120)


class ArcPanel(BaseModel):
    id: str = Field(min_length=1, max_length=255)
    thumbnail: ArcAsset | None = None
    video: ArcAsset | None = None


class ArcRowUpdate(BaseModel):
    title: str = Field(default="Untitled Arc", min_length=1, max_length=120)
    panels: list[ArcPanel] = Field(default_factory=list, max_length=12)
    video: ArcAsset | None = None
    thumbnails: list[ArcAsset] = Field(default_factory=list, max_length=12)


class ArcRow(BaseModel):
    id: str
    panels: list[ArcPanel]
    title: str
    position: int
    video: ArcAsset | None
    thumbnails: list[ArcAsset]
    created_at: datetime
    updated_at: datetime
