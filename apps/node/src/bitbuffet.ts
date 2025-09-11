import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { z, ZodSchema } from 'zod';
import { zodToJsonSchema } from 'zod-to-json-schema';

const BASE_API_URL="https://api.bitbuffet.dev"
const BASE_API_VERSION="v1"
const DEFAULT_TIMEOUT=60000

type ReasoningEffort = 'medium' | 'high';
type ExtractionMethod = 'json' | 'markdown';

interface BaseConfig {
  temperature?: number;
  prompt?: string;
  reasoning_effort?: ReasoningEffort;
  top_p?: number;
}

interface JsonConfig extends BaseConfig {
  method?: 'json';
}

interface MarkdownConfig extends BaseConfig {
  method: 'markdown';
}

export class BitBuffet {
  private baseUrl: string;
  private client: AxiosInstance;

  constructor(apiKey: string) {
    // Validate API key
    if (!apiKey || !apiKey.trim()) {
      throw new Error('API key is required. Please provide a valid API key when initializing the BitBuffet.');
    }
    this.baseUrl = `${BASE_API_URL}/${BASE_API_VERSION}`;
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    });
  }

  // Overload for JSON extraction with schema (required)
  async extract<T>(
    url: string,
    schema: ZodSchema<T>,
    config?: JsonConfig,
    timeout?: number
  ): Promise<T>;

  // Overload for markdown extraction without schema
  async extract(
    url: string,
    config: MarkdownConfig,
    timeout?: number
  ): Promise<string>;

  // Overload for markdown extraction with schema (returns string, ignores schema)
  async extract<T>(
    url: string,
    schema: ZodSchema<T>,
    config: MarkdownConfig,
    timeout?: number
  ): Promise<string>;

  // NEW: Overload for JSON method without schema (will throw error at runtime)
  async extract(
    url: string,
    config: JsonConfig,
    timeout?: number
  ): Promise<never>;

  // Implementation
  async extract<T>(
    url: string,
    schemaOrConfig?: ZodSchema<T> | MarkdownConfig | JsonConfig,
    configOrTimeout?: JsonConfig | MarkdownConfig | number,
    timeout: number = DEFAULT_TIMEOUT
  ): Promise<T | string | never> {
    try {
      let method: ExtractionMethod = 'json';
      let schema: ZodSchema<T> | undefined;
      let config: BaseConfig = {};
      let actualTimeout = timeout;
  
      // Parse arguments based on overload
      if (schemaOrConfig && typeof schemaOrConfig === 'object' && 'method' in schemaOrConfig) {
        // Config as second parameter: extract(url, config, timeout?)
        method = schemaOrConfig!.method!;
        config = schemaOrConfig;
        if (typeof configOrTimeout === 'number') {
          actualTimeout = configOrTimeout;
        }
      } else {
        // Schema as second parameter: extract(url, schema, config?, timeout?)
        schema = schemaOrConfig as ZodSchema<T>;
        if (typeof configOrTimeout === 'object') {
          config = configOrTimeout;
          method = configOrTimeout.method || 'json';
        } else if (typeof configOrTimeout === 'number') {
          actualTimeout = configOrTimeout;
        }
      }
  
      // Validate that both temperature and top_p are not provided simultaneously
      if (config.temperature !== undefined && config.top_p !== undefined) {
        throw new Error("Cannot specify both 'temperature' and 'top_p' parameters. Please use only one.");
      }
  
      // Validate method and schema requirements
      if (method === 'json' && !schema) {
        throw new Error("json_schema is required when method is 'json'");
      }
      // Remove the restriction for markdown + schema since it's now allowed
      // The schema will simply be ignored for markdown extraction
      if (method === 'markdown' && schema) {
        throw new Error("json_schema should not be defined when method is 'markdown'");
      }
  
      const payload: any = {
        url,
        method,
      };
  
      // Add schema for JSON method
      if (method === 'json' && schema) {
        const jsonSchema = zodToJsonSchema(schema);
        payload.json_schema = jsonSchema;
      }
  
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
        timeout: actualTimeout,
      });
  
      const result = response.data;
      
      if (!result.success) {
        throw new Error(`API returned error: ${result.error || 'Unknown error'}`);
      }
  
      // Return based on method
      if (method === 'markdown') {
        return result.data as string;
      } else {
        // Validate and return the result using Zod for JSON method
        return schema!.parse(result.data) as T;
      }
      
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