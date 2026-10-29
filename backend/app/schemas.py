from typing import Literal, Optional
from pydantic import BaseModel, Field, field_validator

Objective = Literal["Engagement", "Product Promotion", "Brand Awareness", "Lead Generation",
                    "Product Launch", "Community Building", "Educational Content", "Event Promotion"]
Hashtags = Literal["none", "few", "ai"]


class GenerateRequest(BaseModel):
    brand_name: str = Field("", max_length=80)
    industry: str = Field("", max_length=80)
    objective: Objective
    products: str = Field(..., min_length=10, max_length=1500)
    audience: str = Field("", max_length=300)
    tones: list[str] = Field(default_factory=list, max_length=10)
    guidelines: str = Field("", max_length=1500)
    reference_posts: str = Field("", max_length=5000)
    language: str = Field("English", max_length=40)
    hashtags: Hashtags = "ai"
    variation: int = Field(0, ge=0, le=1000)  # bumped on regeneration

    @field_validator("products")
    @classmethod
    def _not_blank(cls, v: str) -> str:
        if len(v.strip()) < 10:
            raise ValueError("Describe your products or services (at least 10 characters).")
        return v.strip()


class BrandVoice(BaseModel):
    summary: list[str] = Field(..., min_length=3, max_length=4)
    tone: list[str] = Field(..., min_length=1)
    target_audience: str = Field(..., min_length=1)
    content_themes: list[str] = Field(..., min_length=1)
    writing_style: str = Field(..., min_length=1)
    analysis_basis: str = ""


class Tweet(BaseModel):
    id: int
    category: str
    text: str
    rationale: str
    character_count: int = 0


class GenerateResponse(BaseModel):
    brand_voice: BrandVoice
    tweets: list[Tweet]
    warnings: list[str] = []
    basis: Optional[str] = None  # reference_posts | preferences | inference
