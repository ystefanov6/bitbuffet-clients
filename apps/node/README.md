# bitbuffet Client (TypeScript/JavaScript)

A TypeScript/JavaScript SDK for the bitbuffet API (BitBuffet) that allows you to extract structured data using Zod schemas from anything in under two seconds.

## Installation

```bash
npm install bitbuffet
# or
yarn add bitbuffet
```

## Quick Start

```typescript
import { BitBuffet } from 'bitbuffet';
import { z } from 'zod';

// Define your data structure
const ArticleSchema = z.object({
  title: z.string(),
  author: z.string(),
  content: z.string(),
  tags: z.array(z.string())
});

type Article = z.infer<typeof ArticleSchema>;

// Initialize the client
const client = new BitBuffet('your-api-key');

// Scrape and extract structured data
const result: Article = await client.scrape(
  'https://example.com/article',
  ArticleSchema
);

console.log(`Title: ${result.title}`);
console.log(`Author: ${result.author}`);
```

## Configuration

You can configure the scraping with various options:

```typescript
const result = await client.scrape(
  'https://example.com',
  ArticleSchema,
  {
    reasoning_effort: 'high', // 'medium' or 'high'
    prompt: 'Extract the main article content',
    temperature: 0.7 // or use top_p instead
  },
  30000 // timeout in milliseconds
);
```