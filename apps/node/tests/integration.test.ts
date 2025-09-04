import { ScraperClient } from '../src/scraper';
import { RecipeSchema } from '../src/schemas/recipe';
import { describe, test, expect } from '@jest/globals';
import { ArticleSchema } from '../src/schemas/article';

describe('Integration Tests', () => {
  describe('Real API Calls', () => {
    test('should scrape real recipe URL', async () => {
      const client = new ScraperClient();
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.scrape(url, RecipeSchema, 60000, 'fast');
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      expect(result.steps.length).toBeGreaterThan(0);
    });
    test('should scrape real article URL', async () => {
      const client = new ScraperClient();
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.scrape(url, ArticleSchema);
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String),
        author: expect.any(String)
      }));
    });
  });
});