import { BitBuffet } from '../src/scraper';
import { RecipeSchema } from '../src/schemas/recipe';
import { describe, test, expect } from '@jest/globals';
import { ArticleSchema } from '../src/schemas/article';

const client = new BitBuffet(process.env.TEST_API_KEY as string);

describe('Integration Tests', () => {
  describe('Real API Calls', () => {
    test('should scrape real recipe URL with config', async () => {
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.scrape(url, RecipeSchema, {}, 60000);
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      expect(result.steps.length).toBeGreaterThan(0);
    }, 60000);

    test('should scrape real article URL with minimal parameters', async () => {
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.scrape(url, ArticleSchema);
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String),
        author: expect.any(String)
      }));
    });

    test('should scrape recipe with all config parameters', async () => {
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.scrape(
        url, 
        RecipeSchema, 
        {
          reasoning_effort: 'high',
          prompt: 'Focus on extracting detailed ingredient measurements and cooking times',
          temperature: 1.0
        },
        60000
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      expect(result.steps.length).toBeGreaterThan(0);
      expect(result.time.total).toBeGreaterThan(0);
    }, 60000);

    test('should scrape article with reasoning effort and prompt in config', async () => {
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.scrape(
        url, 
        ArticleSchema, 
        {
          reasoning_effort: 'high',
          prompt: 'Extract the most important quotes and ensure accuracy'
        },
        45000
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String),
        author: expect.any(String)
      }));
      expect(Array.isArray(result.important_quotes)).toBe(true);
    }, 60000);

    test('should handle different temperature values in config', async () => {
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      // Test with low temperature (more deterministic)
      const resultLow = await client.scrape(
        url, 
        RecipeSchema, 
        {
          reasoning_effort: 'medium',
          temperature: 0.1
        },
        60000
      );
      
      expect(resultLow).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      
      const resultHigh = await client.scrape(
        'https://www.bbc.com/news/articles/clyrev00lwno',
        ArticleSchema,
        {
          reasoning_effort: 'medium',
          temperature: 1.2
        },
        60000
      );
      
      expect(resultHigh).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
    }, 60000);

    test('should handle top_p parameter in config', async () => {
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.scrape(
        url, 
        ArticleSchema, 
        {
          reasoning_effort: 'medium',
          top_p: 0.8
        },
        45000
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String),
        author: expect.any(String)
      }));
    }, 60000);

    test('should work with only reasoning effort parameter in config', async () => {
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.scrape(
        url, 
        RecipeSchema, 
        { reasoning_effort: 'high' },
        60000
      );
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      expect(result.steps.length).toBeGreaterThan(0);
    }, 60000);
  });
});