<img src="https://www.bitbuffet.dev/_next/image?url=%2Fbitbuffet-logo-closed-transparent.png&w=64&q=75" alt="BitBuffet Logo" width="64" height="64">

# BitBuffet Client SDKs

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![GitHub issues](https://img.shields.io/github/issues/ystefanov6/bitbuffet-clients)](https://github.com/ystefanov6/bitbuffet-clients/issues)
[bitbuffet.dev](https://bitbuffet.dev)

Official client SDKs for the BitBuffet API - Extract structured data from any web content in under two seconds using AI-powered extraction.

## 🚀 What is BitBuffet?

BitBuffet is a powerful API that allows you to extract structured data from any web page using AI. Simply provide a URL and define your desired data structure using schemas (Zod for TypeScript/JavaScript, Pydantic for Python), and BitBuffet will intelligently extract the relevant information in the exact format you need.

### Key Features

- **⚡ Fast**: Extract data in under 2 seconds
- **🎯 Accurate**: AI-powered extraction with high precision
- **🔧 Flexible**: Custom prompts and reasoning levels
- **📊 Structured**: Get data in your exact format using schemas
- **📝 Raw Content**: Extract raw markdown content when needed
- **🌐 Universal**: Works with any website or web content (url, image, video, audio, youtube, pdf, etc.)
- **🔒 Reliable**: Built for production use with proper error handling

## 📦 Available SDKs

### TypeScript/JavaScript SDK

[![npm version](https://badge.fury.io/js/bitbuffet.svg)](https://badge.fury.io/js/bitbuffet)

Perfect for Node.js applications, web apps, and serverless functions.

```bash
npm install bitbuffet
```

**Features:**
- Full TypeScript support with Zod schemas
- Modern async/await API
- Comprehensive type safety
- Works in Node.js 16+
- Support for both JSON and markdown extraction

[📖 View TypeScript/JavaScript Documentation](./apps/node/README.md)

### Python SDK

[![PyPI version](https://badge.fury.io/py/bitbuffet.svg)](https://badge.fury.io/py/bitbuffet)

Ideal for data science, web extraction, and Python applications.

```bash
pip install bitbuffet
```

**Features:**
- Pydantic models for data validation
- Pythonic API design
- Support for Python 3.9+
- Async/await support
- Support for both JSON and markdown extraction

[📖 View Python Documentation](./apps/python/README.md)

## 🏃‍♂️ Quick Start Examples

### TypeScript/JavaScript - JSON Extraction

```typescript
import { BitBuffet } from 'bitbuffet';
import { z } from 'zod';

const ArticleSchema = z.object({
  title: z.string(),
  author: z.string(),
  content: z.string(),
  publishDate: z.string()
});

const client = new BitBuffet('your-api-key');
const article = await client.extract(
  'https://example.com/article',
  ArticleSchema
);

console.log(article.title);
```

### TypeScript/JavaScript - Markdown Extraction

```typescript
import { BitBuffet } from 'bitbuffet';

const client = new BitBuffet('your-api-key');
const markdown = await client.extract(
  'https://example.com/article',
  { format: 'markdown' }
);

console.log(markdown);
```

### Python - JSON Extraction

```python
from bitbuffet import BitBuffet
from pydantic import BaseModel

class Article(BaseModel):
    title: str
    author: str
    content: str
    publish_date: str

client = BitBuffet(api_key="your-api-key")
article = client.extract(
    url="https://example.com/article",
    schema_class=Article
)

print(article.title)
```

### Python - Markdown Extraction

```python
from bitbuffet import BitBuffet

client = BitBuffet(api_key="your-api-key")
markdown = client.extract(
    url="https://example.com/article",
    format="markdown"
)

print(markdown)
```

## ⚙️ Extraction Methods

Both SDKs support two extraction methods controlled by the `format` parameter:

### JSON Format (Default)
- **Purpose**: Extract structured data according to your schema
- **Output**: Validated data matching your schema (Zod/Pydantic model)
- **Use Case**: When you need specific data fields in a structured format
- **Requirements**: Schema must be provided
- **Format Parameter**: `format: 'json'` (optional - this is the default)

### Markdown Format
- **Purpose**: Extract raw markdown content from the webpage
- **Output**: Raw markdown string
- **Use Case**: When you need the full content for processing, analysis, or conversion
- **Requirements**: No schema needed, format must be explicitly specified
- **Format Parameter**: `format: 'markdown'` (required)

### TypeScript/JavaScript Format Usage:

```typescript
// JSON extraction (format parameter optional)
const structuredData = await client.extract(
  'https://example.com/article',
  ArticleSchema,
  { format: 'json' } // Optional - this is default
);

// Markdown extraction (format parameter required)
const markdownContent = await client.extract(
  'https://example.com/article',
  { format: 'markdown' }
);
```

### Python Format Usage:

```python
# JSON extraction (format parameter optional)
structured_data = client.extract(
    url="https://example.com/article",
    schema_class=Article,
    format="json"  # Optional - this is default
)

# Markdown extraction (format parameter required)
markdown_content = client.extract(
    url="https://example.com/article",
    format="markdown"
)
```

## 🎯 Use Cases

- **Content Aggregation**: Extract articles, blog posts, and news content
- **E-commerce**: Extract product information, prices, and reviews
- **Lead Generation**: Extract contact information and company details
- **Market Research**: Gather competitive intelligence and pricing data
- **Data Migration**: Convert unstructured web content to structured data
- **Content Processing**: Extract raw content for further analysis or conversion
- **Monitoring**: Track changes in web content over time

## 🔧 Configuration Options

Both SDKs support advanced configuration:

- **Format Selection**: Choose between 'json' and 'markdown' extraction
- **Reasoning Effort**: Choose between 'medium' and 'high' for complex pages
- **Custom Prompts**: Guide the extraction with specific instructions
- **Temperature Control**: Adjust consistency vs creativity in extraction
- **Timeout Settings**: Configure request timeouts for your needs

## 📚 Documentation

For comprehensive documentation, API reference, and advanced examples:

**[📖 Complete API Documentation](https://bitbuffet.dev/docs/overview)**

The documentation includes:
- Detailed API reference
- Advanced usage examples
- Best practices and tips
- Troubleshooting guides
- Rate limiting information
- Authentication details

## 🛠️ Development

This repository uses a monorepo structure with separate packages for each language:

```
bitbuffet-clients/
├── apps/
│   ├── node/          # TypeScript/JavaScript SDK
│   └── python/        # Python SDK
└── README.md          # This file
```

### Contributing

We welcome contributions! Please see the individual SDK directories for specific development instructions:

- [Node.js Development Guide](./apps/node/README.md#development)
- [Python Development Guide](./apps/python/README.md#development)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🔗 Links

- [Complete API Documentation](https://bitbuffet.dev/docs/overview)
- [GitHub Repository](https://github.com/ystefanov6/bitbuffet-clients)
- [Report Issues](https://github.com/ystefanov6/bitbuffet-clients/issues)
- [TypeScript/JavaScript SDK on npm](https://www.npmjs.com/package/bitbuffet)
- [Python SDK on PyPI](https://pypi.org/project/bitbuffet/)

## 💡 Support

Need help? Here are your options:

1. **Documentation**: Check our [complete documentation](https://bitbuffet.dev/docs/overview)
2. **Issues**: [Open an issue](https://github.com/ystefanov6/bitbuffet-clients/issues) on GitHub
3. **Examples**: Browse the examples in each SDK's documentation

---

**Ready to get started?** Choose your preferred SDK above and follow the quick start guide!

        