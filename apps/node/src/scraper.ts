import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { z, ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';
import dotenv from 'dotenv'
import path from 'path'

// Configure dotenv to look for .env file in the root directory
dotenv.config({ path: path.resolve(__dirname, '../../../.env') })

type ReasoningEffort = 'medium' | 'high';

export class ScraperClient {
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(baseUrl: string = `${process.env.BASE_API_URL}:${process.env.BASE_API_PORT}`) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
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
    timeout: number = Number(process.env.DEFAULT_TIMEOUT),
    reasoning_effort?: ReasoningEffort,
    prompt?: string,
    top_p?: number,
    temperature?: number
  ): Promise<T> {
    try {
      // Convert Zod schema to JSON schema using the library
      const jsonSchema = zodToJsonSchema(schema);
      
      const payload: any = {
        url,
        schema: jsonSchema,
      };

      // Add optional parameters to payload if provided
      if (reasoning_effort !== undefined) {
        payload.reasoning_effort = reasoning_effort;
      }
      if (prompt !== undefined) {
        payload.prompt = prompt;
      }
      if (top_p !== undefined) {
        payload.top_p = top_p;
      }
      if (temperature !== undefined) {
        payload.temperature = temperature;
      }

      const response: AxiosResponse = await this.client.post('/scrape', payload, {
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