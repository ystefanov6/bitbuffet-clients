# BitBuffet TypeScript/JavaScript SDK

[![npm version](https://badge.fury.io/js/bitbuffet.svg)](https://badge.fury.io/js/bitbuffet)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

A powerful TypeScript/JavaScript SDK for the BitBuffet API that allows you to extract structured data from any web content using Zod schemas in under two seconds.

## 🚀 Features

- **Type-safe**: Built with TypeScript and Zod for complete type safety
- **Fast**: Extract structured data in under 2 seconds
- **Flexible**: Support for custom prompts and reasoning levels
- **Easy to use**: Simple, intuitive API
- **Well-tested**: Comprehensive test suite with integration tests
- **Modern**: Uses async/await and modern JavaScript features

## 📦 Installation

```bash
npm install bitbuffet
# or
yarn add bitbuffet
# or
pnpm add bitbuffet
```

## 🏃‍♂️ Quick Start

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

## ⚙️ Configuration Options

Customize the extraction process with various options:

```typescript
const result = await client.extract(
  'https://example.com/complex-page',
  ArticleSchema,
  {
    reasoning_effort: 'high', // 'medium' | 'high' - Higher effort for complex pages
    prompt: 'Focus on extracting the main article content, ignoring ads and navigation', // Custom prompt (Not recommended)
    temperature: 0.1, // Lower for more consistent results (0.0 - 1.5)
    // OR use top_p instead of temperature
    // top_p: 0.9
  },
  30000 // Timeout in milliseconds (default: 30000)
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

## 🔧 API Reference

### `BitBuffet` Class

#### Constructor
```typescript
new BitBuffet(apiKey: string) // API key from https://bitbuffet.dev
```

#### Methods

##### `extract<T>(url: string, schema: ZodSchema<T>, options?: ExtractionOptions, timeout?: number): Promise<T>`

Extracts structured data from a URL using the provided Zod schema.

**Parameters:**
- `url`: The URL to extract data from
- `schema`: Zod schema defining the expected data structure
- `options`: Optional extraction configuration
- `timeout`: Request timeout in milliseconds (default: 30000)

**Returns:** Promise resolving to the extracted data matching your schema

### Types

```typescript
interface ExtractionOptions {
  reasoning_effort?: 'medium' | 'high';
  prompt?: string;
  temperature?: number; // 0.0 - 1.5
  top_p?: number; // Alternative to temperature
}

interface ClientOptions {
  baseURL?: string;
  timeout?: number;
}
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