from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, ConfigDict, Field

CollectionName = Literal["inventory", "achievements", "store"]


class CollectionItemCreate(BaseModel):
    collection: CollectionName
    name: str = Field(min_length=1, max_length=120)
    summary: str = Field(default="", max_length=240)
    description: str = Field(default="", max_length=10_000)
    thumbnail_url: str | None = Field(default=None, max_length=2_000)
    image_url: str | None = Field(default=None, max_length=2_000)
    details: dict[str, Any] = Field(default_factory=dict)


class CollectionItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    summary: str | None = Field(default=None, max_length=240)
    description: str | None = Field(default=None, max_length=10_000)
    thumbnail_url: str | None = Field(default=None, max_length=2_000)
    image_url: str | None = Field(default=None, max_length=2_000)
    details: dict[str, Any] | None = None


class CollectionItem(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    collection: CollectionName
    name: str
    summary: str
    description: str
    thumbnail_url: str | None
    image_url: str | None
    details: dict[str, Any]
    created_at: datetime
    updated_at: datetime
