from typing import Optional
from pydantic import BaseModel, Field


class Rating(BaseModel):
    rating: float
    count: int

class Time(BaseModel):
    cook: int
    prep: int
    total: int

class Metric(BaseModel):
    amount: Optional[float] = Field(None, description="Amount in metric units. Convert to number ALWAYS. If string is '1-2' - go in between (1.5).", json_schema_extra={'example': {'amount': 1.5}})
    unitShort: str
    unitLong: str

class Imperial(BaseModel):
    amount: Optional[float] = Field(None, description="Amount in imperial units. Convert to number ALWAYS. If string is '1-2' - go in between (1.5).", json_schema_extra={'example': {'amount': 1.5}})
    unitShort: str
    unitLong: str

class Measures(BaseModel):
    metric: Metric
    imperial: Imperial

class Ingredients(BaseModel):
    name: str
    preparation: Optional[str] = None
    purpose: Optional[str] = None
    measures: Measures


class IngredientGroups(BaseModel):
    purpose: str
    ingredients: list[Ingredients]

class Nutrient(BaseModel):
    unit: str
    value: int

class Nutrients(BaseModel):
    calories: Nutrient
    protein: Nutrient
    fat: Nutrient
    carbs: Nutrient
    sugar: Nutrient
    fiber: Nutrient
    sodium: Nutrient

class Nutrition(BaseModel):
    calories: int
    nutrients: Nutrients

class RecipeSchema(BaseModel):
    title: str
    description: str
    image_url: str
    author: str
    video_url: Optional[str] = None
    categories: list[str]
    cuisine: str
    time: Time
    ingredient_groups: list[IngredientGroups]
    steps: list[str]
    servings: int
    additional_notes: str
    rating: Rating
    locale: str
    # nutrition: Nutrition
