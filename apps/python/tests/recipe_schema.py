from typing import Optional
from pydantic import BaseModel


class Rating(BaseModel):
    rating: float
    count: int

class Time(BaseModel):
    cook: int
    prep: int
    total: int

class Metric(BaseModel):
    amount: Optional[float] = None
    unitShort: str
    unitLong: str

class Imperial(BaseModel):
    amount: Optional[float] = None
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
