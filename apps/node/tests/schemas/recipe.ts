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
  amount: z.number().nullish().describe("Amount in metric units. Convert to number ALWAYS. If string is '1-2' - go in between (1.5)."),
  unitShort: z.string().nullish(),
  unitLong: z.string().nullish(),
});

const ImperialSchema = z.object({
  amount: z.number().nullish().describe("Amount in imperial units. Convert to number ALWAYS. If string is '1-2' - go in between (1.5)."),
  unitShort: z.string().nullish(),
  unitLong: z.string().nullish(),
});

const MeasuresSchema = z.object({
  metric: MetricSchema,
  imperial: ImperialSchema,
});

const IngredientsSchema = z.object({
  name: z.string(),
  preparation: z.string().nullish(),
  purpose: z.string().nullish(),
  measures: MeasuresSchema,
});

const IngredientGroupsSchema = z.object({
  purpose: z.string().default('None'),
  ingredients: z.array(IngredientsSchema),
});

export const RecipeSchema = z.object({
  title: z.string(),
  description: z.string(),
  image_url: z.string(),
  author: z.string(),
  video_url: z.string().nullish(),
  categories: z.array(z.string()),
  cuisine: z.string(),
  time: TimeSchema,
  ingredient_groups: z.array(IngredientGroupsSchema),
  steps: z.array(z.string()),
  servings: z.number(),
  additional_notes: z.string().nullish(),
  rating: RatingSchema,
  locale: z.string(),
  // nutrition: NutritionSchema, // Commented out like in Python version
});

export type Recipe = z.infer<typeof RecipeSchema>;