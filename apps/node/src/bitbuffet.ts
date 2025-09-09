import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { z, ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

type ReasoningEffort = 'medium' | 'high';

interface ScrapeConfig {
  temperature?: number;
  prompt?: string;
  reasoning_effort?: ReasoningEffort;
  top_p?: number;
}

export class BitBuffet {
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(apiKey: string) {
    // Validate API key
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is required. Please provide a valid API key when initializing the BitBuffet.');
    }
    this.baseUrl = `${process.env.BASE_API_URL}/${process.env.BASE_API_VERSION}`;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Scrape a webpage and return a validated result
   */
  async scrape<T>(
    url: string, 
    schema: ZodSchema<T>, 
    config: ScrapeConfig = {},
    timeout: number = Number(process.env.DEFAULT_TIMEOUT)
  ): Promise<T> {
    try {
      // Validate that both temperature and top_p are not provided simultaneously
      if (config.temperature !== undefined && config.top_p !== undefined) {
        throw new Error("Cannot specify both 'temperature' and 'top_p' parameters. Please use only one.");
      }
      
      // Convert Zod schema to JSON schema using the library
      const jsonSchema = zodToJsonSchema(schema);
      
      const payload: any = {
        url,
        json_schema: jsonSchema,
      };

      // Add optional parameters to payload if provided in config
      if (config.reasoning_effort !== undefined) {
        payload.reasoning_effort = config.reasoning_effort;
      }
      if (config.prompt !== undefined) {
        payload.prompt = config.prompt;
      }
      if (config.top_p !== undefined) {
        payload.top_p = config.top_p;
      }
      if (config.temperature !== undefined) {
        payload.temperature = config.temperature;
      }

      const response: AxiosResponse = await this.client.post('/extract', payload, {
        timeout,
      });

      const result = response.data;
      
      if (!result.success) {
        throw new Error(`API returned error: ${result.error || 'Unknown error'}`);
      }

      // Validate and return the result using Zod
      return schema.parse(result.data);
      
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new Error(`Validation failed: ${error.message}`);
      }
      if (axios.isAxiosError(error)) {
        throw new Error(`API request failed: ${error.message}`);
      }
      throw error;
    }
  }
}