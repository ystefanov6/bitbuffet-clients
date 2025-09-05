import { ScraperClient } from '../src/scraper';
import { RecipeSchema } from '../src/schemas/recipe';
import { describe, test, expect } from '@jest/globals';
import { ArticleSchema } from '../src/schemas/article';

describe('Integration Tests', () => {
  describe('Real API Calls', () => {
    test('should scrape real recipe URL with reasoning effort', async () => {
      const client = new ScraperClient();
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.scrape(url, RecipeSchema, 60000);
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      expect(result.steps.length).toBeGreaterThan(0);
    }, 60000);
    test('should scrape real article URL with minimal parameters', async () => {
      const client = new ScraperClient();
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.scrape(url, ArticleSchema);
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String),
        author: expect.any(String)
      }));
    });

    test('should scrape recipe with all new parameters', async () => {
      const client = new ScraperClient();
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.scrape(
        url, 
        RecipeSchema, 
        60000, 
        'high',
        'Focus on extracting detailed ingredient measurements and cooking times',
        0.9,
        1.2
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.time.total).toBeGreaterThan(0);
    }, 60000);

    test('should scrape article with reasoning effort and prompt', async () => {
      const client = new ScraperClient();
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.scrape(
        url, 
        ArticleSchema, 
        45000,
        'high',
        'Extract the most important quotes and ensure accuracy'
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String),
        author: expect.any(String)
      }));
      expect(Array.isArray(result.important_quotes)).toBe(true);
    }, 60000);

    test('should handle different temperature values', async () => {
      const client = new ScraperClient();
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      // Test with low temperature (more deterministic)
      const resultLow = await client.scrape(
        url, 
        RecipeSchema, 
        60000,
        'medium',
        undefined,
        undefined,
        0.1
      );
      
      expect(resultLow).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      
      const resultHigh = await client.scrape(
        'https://www.bbc.com/news/articles/clyrev00lwno',
        ArticleSchema,
        60000,
        'medium',
        undefined,
        undefined,
        1.5
      );
      
      expect(resultHigh).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
    }, 60000);

    test('should handle top_p parameter', async () => {
      const client = new ScraperClient();
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.scrape(
        url, 
        ArticleSchema, 
        45000,
        'medium',
        undefined,
        0.8,
        1.0
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String),
        author: expect.any(String)
      }));
    }, 60000);

    test('should work with only reasoning effort parameter', async () => {
      const client = new ScraperClient();
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.scrape(
        url, 
        RecipeSchema, 
        60000,
        'high'
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      expect(result.steps.length).toBeGreaterThan(0);
    }, 60000);
  });
});