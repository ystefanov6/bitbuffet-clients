import { z } from 'zod';

export const ArticleSchema = z.object({
  title: z.string(),
  content: z.string(),
  author: z.string(),
  date: z.string(),
  important_quotes: z.array(z.string()).describe('Important quotes from the article. Format in all caps.'),
});

export type Article = z.infer<typeof ArticleSchema>;