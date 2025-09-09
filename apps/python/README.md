# Structured Scraper Client (Python)

A Python SDK for the Structured Scraper API (BitBuffet) that allows you to extract structured data using Pydantic models from anything, in under two seconds.

## Installation

```bash
pip install bitbuffet
```

## Quick Start

```python
from bitbuffet import BitBuffet
from pydantic import BaseModel
from typing import List

# Define your data structure
class Article(BaseModel):
    title: str
    author: str
    content: str
    tags: List[str]

# Initialize the client
client = BitBuffet(api_key="your-api-key")

# Scrape and extract structured data
result = client.scrape(
    url="https://example.com/article",
    schema_class=Article
)

print(f"Title: {result.title}")
print(f"Author: {result.author}")
```

## Configuration

You can configure the client with various options:

```python
result = client.scrape(
    url="https://example.com",
    schema_class=Article,
    timeout=30,  # seconds
    reasoning_effort="high",  # 'medium' or 'high'
    prompt="Extract the main article content",
    temperature=0.7  # or use top_p instead
)
```