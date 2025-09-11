import { BitBuffet } from '../src/bitbuffet';
import { describe, test, expect } from '@jest/globals';
import { RecipeSchema } from './schemas/recipe';
import { ArticleSchema } from './schemas/article';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })


const client = new BitBuffet(process.env.TEST_API_KEY as string);

describe('Integration Tests', () => {
  describe('Real API Calls', () => {
    test('should extract real recipe URL with config', async () => {
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.extract(url, RecipeSchema, {
        "reasoning_effort": "medium"
      }, 60000);
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        author: expect.any(String)
      }));
      expect(result.steps.length).toBeGreaterThan(0);
    }, 60000);

    test('should extract real article URL with minimal parameters', async () => {
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.extract(url, ArticleSchema);
      
      expect(result).toEqual(expect.objectContaining({
        title: expect.any(String),
        content: expect.any(String),
        author: expect.any(String)
      }));
    });

    test('should extract recipe with all config parameters', async () => {
      const url = 'https://www.recipetineats.com/butter-chicken/';
      
      const result = await client.extract(
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

    test('should extract article with reasoning effort and prompt in config', async () => {
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      
      const result = await client.extract(
        url, 
        ArticleSchema, 
        {
          reasoning_effort: 'medium',
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
      const resultLow = await client.extract(
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
      
      const resultHigh = await client.extract(
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
      
      const result = await client.extract(
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
      
      const result = await client.extract(
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

    describe('Format Parameter Integration Tests', () => {
      test('should extract real article as markdown content', async () => {
        const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
        
        const result = await client.extract(url, { format: 'markdown' }, 45000);
        
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(100); // Should have substantial content
        expect(result).toMatch(/^#/m); // Should contain markdown headers
      }, 60000);
    });
  });
});