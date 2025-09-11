/**
 *  Test suite for the TypeScript Structured Scraper Client SDK
 **/

import axios, { AxiosResponse } from 'axios';
import { BitBuffet } from '../src/bitbuffet';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';
import { RecipeSchema } from './schemas/recipe';
import { ArticleSchema } from './schemas/article';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })



// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('BitBuffet', () => {
  let client: BitBuffet;
  let mockAxiosInstance: jest.Mocked<any>;

  // Mock data fixtures
  const mockRecipeResponse = {
    success: true,
    data: {
      title: "Butter Chicken",
      description: "Creamy and delicious butter chicken recipe",
      image_url: "https://example.com/image.jpg",
      author: "Recipe Tin Eats",
      video_url: "https://example.com/video.mp4",
      categories: ["Indian", "Main Course"],
      cuisine: "Indian",
      time: {
        cook: 30,
        prep: 15,
        total: 45
      },
      ingredient_groups: [{
        purpose: "Main ingredients",
        ingredients: [{
          name: "chicken",
          preparation: "diced",
          purpose: "protein",
          measures: {
            metric: {
              amount: 500.0,
              unitShort: "g",
              unitLong: "grams"
            },
            imperial: {
              amount: 1.1,
              unitShort: "lb",
              unitLong: "pounds"
            }
          }
        }]
      }],
      steps: ["Step 1", "Step 2"],
      servings: 4,
      additional_notes: "Serve with basmati rice and naan bread",
      locale: "en-US",
      rating: {
        rating: 4.5,
        count: 100
      }
    }
  };

  const mockArticleResponse = {
    success: true,
    data: {
      title: "Breaking News: Important Event",
      content: "This is the article content...",
      author: "BBC News Reporter",
      date: "2024-01-15",
      important_quotes: ["IMPORTANT QUOTE 1", "IMPORTANT QUOTE 2"]
    }
  };

  const mockErrorResponse = {
    success: false,
    error: "Failed to extract the provided URL"
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup axios mock
    mockAxiosInstance = {
      post: jest.fn()
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Create client instance
    client = new BitBuffet(process.env.TEST_API_KEY as string);
  });

  describe('Client Initialization', () => {
    test('should initialize with default base URL', () => {
      expect(client).toBeInstanceOf(BitBuffet);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: expect.any(String),
        headers: {
          'Authorization': `Bearer ${process.env.TEST_API_KEY}`,
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('Parameter Validation Tests', () => {
    test('should include new parameters in API payload when provided in config', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecipeResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test with all new parameters in config
      const url = 'https://www.recipetineats.com/butter-chicken/';
      await client.extract(
        url,
        RecipeSchema,
        {
          reasoning_effort: 'high',
          prompt: 'Focus on extracting detailed cooking instructions',
          top_p: 0.9,
          // temperature: 1.5
        },
        60000
      );

      // Verify API call includes all parameters
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/extract',
        {
          url,
          method: 'json',  // Add this line
          json_schema: expect.any(Object),
          reasoning_effort: 'high',
          prompt: 'Focus on extracting detailed cooking instructions',
          top_p: 0.9,
          // temperature: 1.5 - API validates if both top_p and temp are present
        },
        { timeout: 60000 }
      );
    });

    test('should not include optional parameters when config is empty', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockArticleResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test with empty config
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      await client.extract(url, ArticleSchema, {});

      // Verify API call excludes optional parameters
      const callArgs = mockAxiosInstance.post.mock.calls[0];
      const payload = callArgs[1];
      
      expect(payload).toEqual({
        url,
        method: 'json',  // Add this line
        json_schema: expect.any(Object)
      });
      expect(payload).not.toHaveProperty('reasoning_effort');
      expect(payload).not.toHaveProperty('prompt');
      expect(payload).not.toHaveProperty('top_p');
      expect(payload).not.toHaveProperty('temperature');
    });

    test('should accept valid reasoning_effort values in config', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecipeResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const validEfforts: ('medium' | 'high')[] = ['medium', 'high'];
      
      for (const effort of validEfforts) {
        await client.extract(
          'https://example.com',
          RecipeSchema,
          { reasoning_effort: effort }
        );

        const callArgs = mockAxiosInstance.post.mock.calls[mockAxiosInstance.post.mock.calls.length - 1];
        const payload = callArgs[1];
        expect(payload.reasoning_effort).toBe(effort);
      }
    });

    test('should accept numeric temperature values in config', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecipeResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test with integer temperature
      await client.extract(
        'https://example.com',
        RecipeSchema,
        { temperature: 1 }
      );

      let callArgs = mockAxiosInstance.post.mock.calls[mockAxiosInstance.post.mock.calls.length - 1];
      let payload = callArgs[1];
      expect(payload.temperature).toBe(1);

      // Test with float temperature
      await client.extract(
        'https://example.com',
        RecipeSchema,
        { temperature: 1.2 }
      );

      callArgs = mockAxiosInstance.post.mock.calls[mockAxiosInstance.post.mock.calls.length - 1];
      payload = callArgs[1];
      expect(payload.temperature).toBe(1.2);
    });

    test('should accept numeric top_p values in config', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecipeResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test with float top_p
      await client.extract(
        'https://example.com',
        RecipeSchema,
        { top_p: 0.9 }
      );

      let callArgs = mockAxiosInstance.post.mock.calls[mockAxiosInstance.post.mock.calls.length - 1];
      let payload = callArgs[1];
      expect(payload.top_p).toBe(0.9);

      // Test with integer top_p
      await client.extract(
        'https://example.com',
        RecipeSchema,
        { top_p: 1 }
      );

      callArgs = mockAxiosInstance.post.mock.calls[mockAxiosInstance.post.mock.calls.length - 1];
      payload = callArgs[1];
      expect(payload.top_p).toBe(1);
    });

    test('should throw error when both temperature and top_p are provided in config', async () => {
      await expect(client.extract(
        'https://example.com',
        RecipeSchema,
        {
          temperature: 1.0,
          top_p: 0.9
        }
      )).rejects.toThrow("Cannot specify both 'temperature' and 'top_p' parameters. Please use only one.");
    });
  });

  describe('Successful Scraping', () => {
    test('should successfully extract recipe with all parameters in config', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecipeResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);
    
      // Test scraping
      const url = 'https://www.recipetineats.com/butter-chicken/';
      const result = await client.extract(
        url, 
        RecipeSchema, 
        {
          reasoning_effort: 'high',
          prompt: 'Focus on extracting detailed cooking instructions',
          temperature: 1.2  // Keep this as 1.2
        },
        60000
      );
    
      // Assertions
      expect(result).toEqual(expect.objectContaining({
        title: 'Butter Chicken',
        author: 'Recipe Tin Eats',
        servings: 4
      }));
      expect(result.time.total).toBe(45);
      expect(result.ingredient_groups).toHaveLength(1);
      expect(result.rating.rating).toBe(4.5);
    
      // Verify API call - Fix the expected values
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/extract',
        {
          url,
          method: 'json',  // Add this line
          json_schema: expect.any(Object),  // This is correct
          reasoning_effort: 'high',
          prompt: 'Focus on extracting detailed cooking instructions',
          temperature: 1.2  // Change from 1.5 to 1.2 to match the actual call
        },
        { timeout: 60000 }
      );
    });

    test('should successfully extract article with minimal parameters', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockArticleResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test scraping
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      const result = await client.extract(url, ArticleSchema);

      // Assertions
      expect(result).toEqual(expect.objectContaining({
        title: 'Breaking News: Important Event',
        author: 'BBC News Reporter',
        date: '2024-01-15'
      }));
      expect(result.important_quotes).toHaveLength(2);
      expect(result.important_quotes.every(quote => quote === quote.toUpperCase())).toBe(true);

      // Verify API call
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/extract',
        {
          url,
          method: 'json',  // Add this line
          json_schema: expect.any(Object)
        },
        { timeout: expect.any(Number) }
      );
    });
  });

  describe('Error Handling', () => {
    test('should handle API error responses', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockErrorResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test that Error is thrown for API errors
      await expect(
        client.extract('https://example.com', ArticleSchema)
      ).rejects.toThrow('API returned error: Failed to extract the provided URL');
    });

    test('should handle network errors', async () => {
      // Setup mock to throw axios error
      const axiosError = new Error('Connection failed');
      (axiosError as any).isAxiosError = true;
      mockAxiosInstance.post.mockRejectedValue(axiosError);

      // Mock axios.isAxiosError
      mockedAxios.isAxiosError.mockReturnValue(true);

      // Test that Error is thrown and properly wrapped
      await expect(
        client.extract('https://example.com', ArticleSchema)
      ).rejects.toThrow('API request failed: Connection failed');
    });

    test('should handle validation errors', async () => {
      // Setup mock response with invalid data
      const invalidResponse = {
        success: true,
        data: {
          title: 'Test',
          // Missing required fields: content, author, date, important_quotes
        }
      };
      const mockResponse: Partial<AxiosResponse> = {
        data: invalidResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test that validation error is thrown
      await expect(
        client.extract('https://example.com', ArticleSchema)
      ).rejects.toThrow('Validation failed');
    });
  });

  describe('Method Parameter Tests', () => {
    test('should successfully extract markdown content without schema', async () => {
      // Setup mock response for markdown extraction
      const mockMarkdownResponse = {
        success: true,
        data: '# Article Title\n\nThis is the markdown content of the article...\n\n## Section 1\n\nMore content here.',
        method: 'markdown'
      };
      
      const mockResponse: Partial<AxiosResponse> = {
        data: mockMarkdownResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test markdown extraction
      const url = 'https://example.com/article';
      const result = await client.extract(url, { method: 'markdown' });

      // Assertions
      expect(typeof result).toBe('string');
      expect(result).toContain('# Article Title');
      expect(result).toContain('This is the markdown content');

      // Verify API call
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/extract',
        {
          url,
          method: 'markdown'
        },
        { timeout: expect.any(Number) }
      );
    });

    test('should throw error when schema is provided with markdown method', async () => {
      await expect(client.extract(
        'https://example.com',
        ArticleSchema,
        { method: 'markdown' }
      )).rejects.toThrow("json_schema should not be defined when method is 'markdown'");
    });

    test('should throw error when no schema is provided with json method', async () => {
      await expect(client.extract(
        'https://example.com',
        { method: 'json' }
      )).rejects.toThrow("json_schema is required when method is 'json'");
    });
  });
});