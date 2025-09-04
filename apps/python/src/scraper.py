import requests
from typing import Dict, Any, Type, Optional, Literal, TypeVar
import json
from pydantic import BaseModel
import os
from dotenv import load_dotenv

load_dotenv()

# Define a TypeVar bound to BaseModel
T = TypeVar('T', bound=BaseModel)

class ScraperClient:
    """Python SDK for the Structured Scraper API"""
    base_url = f"{os.getenv("BASE_API_URL")}:{os.getenv("BASE_API_PORT")}"
    
    def __init__(self, base_url: str = base_url):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
    
    def _pydantic_to_json_schema(self, schema_class: Type[BaseModel]) -> Dict[str, Any]:
        """Convert a Pydantic model to JSON schema format"""
        schema = schema_class.model_json_schema()
        
        # Resolve $ref references to inline definitions
        if '$defs' in schema:
            def resolve_refs(obj, defs):
                if isinstance(obj, dict):
                    if '$ref' in obj:
                        ref_path = obj['$ref'].split('/')[-1]
                        return resolve_refs(defs[ref_path], defs)
                    else:
                        return {k: resolve_refs(v, defs) for k, v in obj.items()}
                elif isinstance(obj, list):
                    return [resolve_refs(item, defs) for item in obj]
                return obj
            
            schema = resolve_refs(schema, schema['$defs'])
            schema.pop('$defs', None)
        
        return schema
    
    def scrape(
        self, 
        url: str, 
        schema_class: Type[T], 
        timeout: int = int(os.getenv("DEFAULT_TIMEOUT"))/1000,
        method: Literal["fast", "balanced", "thorough"] = "fast",
        prompt: Optional[str] = None
    ) -> T:
        """
        Scrape a webpage and return a validated Pydantic model instance.
        
        Args:
            url: The URL to scrape
            schema_class: Pydantic BaseModel class to validate against
            timeout: Request timeout in seconds
            method: Scraping method - "fast", "balanced", or "thorough"
            prompt: Additional custom prompt for extra configurability
            
        Returns:
            Validated Pydantic model instance of the same type as schema_class
            
        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response is invalid
        """
        # Convert Pydantic schema to JSON schema
        schema = self._pydantic_to_json_schema(schema_class)
        
        payload = {
            "url": url,
            "schema": schema,
            "method": method
        }
        
        # Add prompt to payload if provided
        if prompt is not None:
            payload["prompt"] = prompt
        
        try:
            response = self.session.post(
                f"{self.base_url}/scrape",
                json=payload,
                timeout=timeout,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            result = response.json()
            if not result.get('success'):
                raise ValueError(f"API returned error: {result.get('error', 'Unknown error')}")
            
            # Return validated Pydantic model instance
            return schema_class.model_validate(result['data'])
            
        except requests.RequestException as e:
            raise requests.RequestException(f"API request failed: {e}")
        except json.JSONDecodeError as e:
            raise ValueError(f"Invalid JSON response: {e}")