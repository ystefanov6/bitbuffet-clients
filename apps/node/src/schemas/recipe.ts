import { z } from 'zod';

const RatingSchema = z.object({
  rating: z.number(),
  count: z.number(),
});

const TimeSchema = z.object({
  cook: z.number(),
  prep: z.number(),
  total: z.number(),
});

const MetricSchema = z.object({
  amount: z.number().optional(),
  unitShort: z.string(),
  unitLong: z.string(),
});

const ImperialSchema = z.object({
  amount: z.number().optional(),
  unitShort: z.string(),
  unitLong: z.string(),
});

const MeasuresSchema = z.object({
  metric: MetricSchema,
  imperial: ImperialSchema,
});

const IngredientsSchema = z.object({
  name: z.string(),
  preparation: z.string().optional(),
  purpose: z.string().optional(),
  measures: MeasuresSchema,
});

const IngredientGroupsSchema = z.object({
  purpose: z.string(),
  ingredients: z.array(IngredientsSchema),
});

const NutrientSchema = z.object({
  unit: z.string(),
  value: z.number(),
});

const NutrientsSchema = z.object({
  calories: NutrientSchema,
  protein: NutrientSchema,
  fat: NutrientSchema,
  carbs: NutrientSchema,
  sugar: NutrientSchema,
  fiber: NutrientSchema,
  sodium: NutrientSchema,
});

const NutritionSchema = z.object({
  calories: z.number(),
  nutrients: NutrientsSchema,
});

export const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
  author: z.string(),
  video_url: z.string().optional(),
  categories: z.array(z.string()),
  cuisine: z.string(),
  time: TimeSchema,
  ingredient_groups: z.array(IngredientGroupsSchema),
  steps: z.array(z.string()),
  servings: z.number(),
  additional_notes: z.string(),
  rating: RatingSchema,
  locale: z.string(),
  // nutrition: NutritionSchema, // Commented out like in Python version
});

export type Recipe = z.infer<typeof RecipeSchema>;