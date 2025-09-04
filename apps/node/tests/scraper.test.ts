/**
 * Test suite for the TypeScript Structured Scraper Client SDK
 */

import axios, { AxiosResponse } from 'axios';
import { ScraperClient } from '../src/scraper';
import { RecipeSchema } from '../src/schemas/recipe';
import { ArticleSchema } from '../src/schemas/article';
import { jest, describe, test, expect, beforeEach } from '@jest/globals';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('ScraperClient', () => {
  let client: ScraperClient;
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
      steps: ["Heat oil in pan", "Add chicken and cook"],
      servings: 4,
      additional_notes: "Serve with rice",
      rating: {
        rating: 4.5,
        count: 150
      },
      locale: "en-US"
    }
  };

  const mockArticleResponse = {
    success: true,
    data: {
      title: "Breaking News: Important Event",
      content: "This is the main content of the article with important information.",
      author: "BBC News Reporter",
      date: "2024-01-15",
      important_quotes: ["THIS IS AN IMPORTANT QUOTE", "ANOTHER SIGNIFICANT STATEMENT"]
    }
  };

  const mockErrorResponse = {
    success: false,
    error: "Failed to scrape the provided URL"
  };

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Create mock axios instance
    mockAxiosInstance = {
      post: jest.fn(),
      defaults: { headers: {} }
    };
    
    // Mock axios.create to return our mock instance
    mockedAxios.create.mockReturnValue(mockAxiosInstance);
    
    // Create client instance
    client = new ScraperClient();
  });

  describe('Client Initialization', () => {
    test('should initialize with default parameters', () => {
      const testClient = new ScraperClient();
      expect(testClient).toBeInstanceOf(ScraperClient);
      expect(mockedAxios.create).toHaveBeenCalled();
    });

    test('should initialize with custom base URL', () => {
      const customUrl = 'https://custom-api.example.com';
      const testClient = new ScraperClient(customUrl);
      expect(testClient).toBeInstanceOf(ScraperClient);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: customUrl,
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });

    test('should strip trailing slash from base URL', () => {
      const urlWithSlash = 'https://api.example.com/';
      const testClient = new ScraperClient(urlWithSlash);
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'https://api.example.com',
        headers: {
          'Content-Type': 'application/json'
        }
      });
    });
  });

  describe('Successful Scraping', () => {
    test('should successfully scrape recipe with all parameters', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockRecipeResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test scraping
      const url = 'https://www.recipetineats.com/butter-chicken/';
      const result = await client.scrape(
        url,
        RecipeSchema,
        60000,
        'thorough',
        'Focus on extracting detailed cooking instructions'
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

      // Verify API call
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        {
          url,
          schema: expect.any(Object),
          method: 'thorough',
          prompt: 'Focus on extracting detailed cooking instructions'
        },
        { timeout: 60000 }
      );
    });

    test('should successfully scrape article with minimal parameters', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockArticleResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test scraping
      const url = 'https://www.bbc.co.uk/news/articles/clyrev00lwno';
      const result = await client.scrape(url, ArticleSchema);

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
        '/scrape',
        {
          url,
          schema: expect.any(Object),
          method: 'fast'
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
        client.scrape('https://example.com', ArticleSchema)
      ).rejects.toThrow('API returned error: Failed to scrape the provided URL');
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
        client.scrape('https://example.com', ArticleSchema)
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
        client.scrape('https://example.com', ArticleSchema)
      ).rejects.toThrow(/Validation failed/);
    });

    test('should handle HTTP errors', async () => {
      // Setup mock to throw HTTP error
      const httpError = new Error('404 Not Found');
      (httpError as any).isAxiosError = true;
      mockAxiosInstance.post.mockRejectedValue(httpError);

      // Mock axios.isAxiosError
      mockedAxios.isAxiosError.mockReturnValue(true);

      // Test that HTTPError is thrown
      await expect(
        client.scrape('https://example.com', ArticleSchema)
      ).rejects.toThrow('API request failed: 404 Not Found');
    });
  });

  describe('Method Parameters', () => {
    test('should accept all valid method parameters', async () => {
      const validMethods: Array<'fast' | 'balanced' | 'thorough'> = ['fast', 'balanced', 'thorough'];
      
      for (const method of validMethods) {
        // Setup mock response
        const mockResponse: Partial<AxiosResponse> = {
          data: mockArticleResponse
        };
        mockAxiosInstance.post.mockResolvedValue(mockResponse);

        // This should not throw any errors
        const result = await client.scrape('https://example.com', ArticleSchema, 30000, method);
        expect(result).toEqual(expect.objectContaining({
          title: 'Breaking News: Important Event'
        }));
      }
    });

    test('should pass timeout parameter correctly', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockArticleResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test with custom timeout
      await client.scrape('https://example.com', ArticleSchema, 60000);

      // Verify timeout was passed to the request
      expect(mockAxiosInstance.post).toHaveBeenCalledWith(
        '/scrape',
        expect.any(Object),
        { timeout: 60000 }
      );
    });

    test('should handle optional prompt parameter', async () => {
      // Setup mock response
      const mockResponse: Partial<AxiosResponse> = {
        data: mockArticleResponse
      };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      // Test without prompt
      await client.scrape('https://example.com', ArticleSchema);
      let callArgs = mockAxiosInstance.post.mock.calls[0][1];
      expect(callArgs).not.toHaveProperty('prompt');

      // Test with prompt
      await client.scrape('https://example.com', ArticleSchema, 30000, 'fast', 'Custom prompt');
      callArgs = mockAxiosInstance.post.mock.calls[1][1];
      expect(callArgs).toHaveProperty('prompt', 'Custom prompt');
    });
  });
});