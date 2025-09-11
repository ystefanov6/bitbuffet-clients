<img src="https://www.bitbuffet.dev/_next/image?url=%2Fbitbuffet-logo-closed-transparent.png&w=64&q=75" alt="BitBuffet Logo" width="64" height="64">

# BitBuffet TypeScript/JavaScript SDK

[![npm version](https://badge.fury.io/js/bitbuffet.svg)](https://badge.fury.io/js/bitbuffet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful TypeScript/JavaScript SDK for the BitBuffet API that allows you to extract structured data from any web content using Zod schemas or raw markdown content in under two seconds.

## 🚀 Features

- **Universal**: Works with any website or web content (url, image, video, audio, youtube, pdf, etc.)
- **Type-safe**: Built with TypeScript and Zod for complete type safety
- **Fast**: Extract structured data in under 2 seconds
- **Flexible**: Support for custom prompts and reasoning levels
- **Dual Output**: Extract structured JSON data or raw markdown content
- **Easy to use**: Simple, intuitive API
- **Well-tested**: Comprehensive test suite with integration tests

## 📦 Installation

```bash
npm install bitbuffet
# or
yarn add bitbuffet
# or
pnpm add bitbuffet
```

## 🏃‍♂️ Quick Start

### JSON Extraction (Structured Data)

```typescript
import { BitBuffet } from 'bitbuffet';
import { z } from 'zod';

// Define your data structure with Zod
const ArticleSchema = z.object({
  title: z.string().describe('The main title of the article'),
  author: z.string().describe('The author of the article'),
  publishDate: z.string().describe('When the article was published'),
  content: z.string().describe('The main content/body of the article'),
  tags: z.array(z.string()).describe('Article tags or categories'),
  summary: z.string().describe('A brief summary of the article')
});

type Article = z.infer<typeof ArticleSchema>;

// Initialize the client with your API key
const client = new BitBuffet('your-api-key-here');

// Extract structured data from any URL
try {
  const result: Article = await client.extract(
    'https://example.com/article',
    ArticleSchema
  );
  
  console.log(`Title: ${result.title}`);
  console.log(`Author: ${result.author}`);
  console.log(`Published: ${result.publishDate}`);
  console.log(`Tags: ${result.tags.join(', ')}`);
} catch (error) {
  console.error('Extraction failed:', error);
}
```

### Markdown Extraction (Raw Content)

```typescript
import { BitBuffet } from 'bitbuffet';

const client = new BitBuffet('your-api-key-here');

// Extract raw markdown content
try {
  const markdown: string = await client.extract(
    'https://example.com/article',
    { format: 'markdown' }
  );
  
  console.log('Raw markdown content:');
  console.log(markdown);
} catch (error) {
  console.error('Extraction failed:', error);
}
```

## ⚙️ Output Methods

Choose between structured JSON extraction or raw markdown content:

### JSON Format (Default)
Extracts structured data according to your Zod schema:

```typescript
const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  description: z.string()
});

const product = await client.extract(
  'https://example.com/product',
  ProductSchema,
  { format: 'json' } // Optional - this is the default
);
```

### Markdown Format
Returns the raw markdown content of the webpage:

```typescript
const markdown = await client.extract(
  'https://example.com/article',
  { format: 'markdown' }
);
```

**Note:** When using `format: 'markdown'`, do not provide a schema as the second parameter.

### Format Usage Patterns

The SDK supports two extraction methods via the `format` parameter:

#### JSON Extraction (Default)
```typescript
// Format 1a: Schema with optional config (format defaults to 'json')
const result = await client.extract(
  'https://example.com/article',
  ArticleSchema,
  { 
    format: 'json', // Optional - this is the default
    reasoning_effort: 'high' 
  }
);

// Format 1b: Schema without config (format defaults to 'json')
const result = await client.extract(
  'https://example.com/article',
  ArticleSchema
);
```

#### Markdown Extraction
```typescript
// Format 2a: Config object with format specified
const markdown = await client.extract(
  'https://example.com/article',
  { 
    format: 'markdown',
    reasoning_effort: 'medium',
    prompt: 'Focus on main content'
  }
);

// Format 2b: Minimal markdown extraction
const markdown = await client.extract(
  'https://example.com/article',
  { format: 'markdown' }
);
```

#### Important Format Rules:

1. **JSON Format Requirements:**
   - A Zod schema MUST be provided as the second parameter
   - Returns typed data matching your schema
   - `format: 'json'` is optional (default behavior)

2. **Markdown Format Requirements:**
   - NO schema should be provided
   - `format: 'markdown'` MUST be specified in config object
   - Returns raw markdown string
   - Schema and markdown format cannot be used together

3. **Format Parameter Location:**
   - Always specified in the configuration object
   - Never passed as a separate parameter

## ⚙️ Configuration Options

Customize the extraction process with various options:

```typescript
// JSON extraction with configuration
const result = await client.extract(
  'https://example.com/complex-page',
  ArticleSchema,
  {
    format: 'json', // Optional - default behavior
    reasoning_effort: 'high', // 'medium' | 'high' - Higher effort for complex pages
    prompt: 'Focus on extracting the main article content, ignoring ads and navigation',
    temperature: 0.1, // Lower for more consistent results (0.0 - 1.5)
    // OR use top_p instead of temperature
    // top_p: 0.9
  },
  30000 // Timeout in milliseconds (default: 30000)
);

// Markdown extraction with configuration
const markdown = await client.extract(
  'https://example.com/article',
  {
    format: 'markdown',
    reasoning_effort: 'medium',
    prompt: 'Focus on the main content, ignore navigation and ads'
  },
  30000
);
```

## 📚 Advanced Examples

### E-commerce Product Extraction

```typescript
const ProductSchema = z.object({
  name: z.string(),
  price: z.number(),
  currency: z.string(),
  description: z.string(),
  images: z.array(z.string().url()),
  inStock: z.boolean(),
  rating: z.number().min(0).max(5).optional(),
  reviews: z.number().optional()
});

const product = await client.extract(
  'https://shop.example.com/product/123',
  ProductSchema,
  { reasoning_effort: 'high' }
);
```

### News Article with Metadata

```typescript
const NewsSchema = z.object({
  headline: z.string(),
  subheadline: z.string().optional(),
  author: z.object({
    name: z.string(),
    bio: z.string().optional()
  }),
  publishedAt: z.string(),
  category: z.string(),
  content: z.string(),
  relatedArticles: z.array(z.object({
    title: z.string(),
    url: z.string().url()
  })).optional()
});

const article = await client.extract(
  'https://news.example.com/breaking-news',
  NewsSchema
);
```

### Raw Content for Processing

```typescript
// Extract raw markdown for further processing
const rawContent = await client.extract(
  'https://blog.example.com/post/123',
  { format: 'markdown' }
);

// Process the markdown content
const wordCount = rawContent.split(' ').length;
const hasCodeBlocks = rawContent.includes('```');

console.log(`Content has ${wordCount} words`);
console.log(`Contains code blocks: ${hasCodeBlocks}`);
```

## 🔧 API Reference

### `BitBuffet` Class

#### Constructor
```typescript
new BitBuffet(apiKey: string) // API key from https://bitbuffet.dev
```

#### Methods

##### JSON Extraction
```typescript
extract<T>(
  url: string,
  schema: ZodSchema<T>,
  config?: JsonConfig,
  timeout?: number
): Promise<T>
```

##### Markdown Extraction
```typescript
extract(
  url: string,
  config: MarkdownConfig,
  timeout?: number
): Promise<string>
```

**Parameters:**
- `url`: The URL to extract data from
- `schema`: Zod schema defining the expected data structure (JSON format only)
- `config`: Extraction configuration options
- `timeout`: Request timeout in milliseconds (default: 30000)

**Returns:** 
- JSON format: Promise resolving to the extracted data matching your schema
- Markdown format: Promise resolving to raw markdown content as string

### Types

```typescript
interface JsonConfig {
  format?: 'json'; // Optional - this is the default
  reasoning_effort?: 'medium' | 'high';
  prompt?: string;
  temperature?: number; // 0.0 - 1.5
  top_p?: number; // Alternative to temperature
}

interface MarkdownConfig {
  format: 'markdown'; // Required for markdown extraction
  reasoning_effort?: 'medium' | 'high';
  prompt?: string;
  temperature?: number; // 0.0 - 1.5
  top_p?: number; // Alternative to temperature
}

type ExtractionMethod = 'json' | 'markdown';
```

## 🛠️ Development

```bash
# Install dependencies
yarn install

# Run tests
yarn test

# Run tests in watch mode
yarn test:watch

# Run integration tests
yarn test:integration

# Build the project
yarn build

# Run manual test
yarn test:manual
```

## 📋 Requirements

- Node.js >= 16.0.0
- TypeScript >= 4.5.0 (for TypeScript projects)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Complete API Documentation](https://bitbuffet.dev/docs/overview) - Full API reference and guides
- [GitHub Repository](https://github.com/ystefanov6/bitbuffet-clients)
- [npm Package](https://www.npmjs.com/package/bitbuffet)
- [Report Issues](https://github.com/ystefanov6/bitbuffet-clients/issues)

## 💡 Need Help?

For detailed documentation, examples, and API reference, visit our [complete documentation](https://bitbuffet.dev/docs/overview).

If you encounter any issues or have questions, please [open an issue](https://github.com/ystefanov6/bitbuffet-clients/issues) on GitHub.