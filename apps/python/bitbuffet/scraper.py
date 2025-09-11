import requests
from typing import Dict, Any, Type, Optional, Literal, TypeVar, Union, overload
import json
from pydantic import BaseModel

BASE_API_URL="https://api.bitbuffet.dev"
BASE_API_VERSION="v1"
DEFAULT_TIMEOUT=60000

# Define a TypeVar bound to BaseModel
T = TypeVar('T', bound=BaseModel)

class BitBuffet:
    """Python SDK for the Structured Scraper API"""
    
    def __init__(self, api_key: str):
        # Validate API key
        if not api_key or not api_key.strip():
            raise ValueError('API key is required. Please provide a valid API key when initializing the BitBuffet.')
        
        self.base_url = f"{BASE_API_URL}/{BASE_API_VERSION}"
        self.session = requests.Session()
        self.session.headers.update({
            'Authorization': f'Bearer {api_key}',
            'Content-Type': 'application/json'
        })
    
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

    # Overload for JSON extraction with schema
    @overload
    def extract(
        self, 
        url: str, 
        schema_class: Type[T], 
        timeout: int = DEFAULT_TIMEOUT//1000,
        reasoning_effort: Optional[Literal['medium', 'high']] = None,
        prompt: Optional[str] = None,
        top_p: Optional[Union[int, float]] = None,
        temperature: Optional[Union[int, float]] = None,
        format: Literal['json'] = 'json'
    ) -> T: ...

    # Overload for markdown extraction without schema
    @overload
    def extract(
        self, 
        url: str, 
        format: Literal['markdown'],
        timeout: int = DEFAULT_TIMEOUT//1000,
        reasoning_effort: Optional[Literal['medium', 'high']] = None,
        prompt: Optional[str] = None,
        top_p: Optional[Union[int, float]] = None,
        temperature: Optional[Union[int, float]] = None
    ) -> str: ...

    def extract(
        self, 
        url: str, 
        schema_class_or_method: Union[Type[T], Literal['markdown']] = None,
        timeout: int = DEFAULT_TIMEOUT//1000,
        reasoning_effort: Optional[Literal['medium', 'high']] = None,
        prompt: Optional[str] = None,
        top_p: Optional[Union[int, float]] = None,
        temperature: Optional[Union[int, float]] = None,
        format: Optional[Literal['json', 'markdown']] = None
    ) -> Union[T, str]:
        """
        Extract a webpage and return either a validated Pydantic model instance or markdown string.
        
        Args:
            url: The URL to extract
            schema_class_or_method: Pydantic BaseModel class for JSON extraction, or 'markdown' for markdown extraction
            timeout: Request timeout in seconds
            reasoning_effort: Reasoning effort level ('medium' or 'high')
            prompt: Additional custom prompt for extra configurability
            top_p: Top-p sampling parameter for the AI model
            temperature: Temperature parameter for the AI model (0-1.5)
            format: Extraction format ('json' or 'markdown') - inferred if not provided
            
        Returns:
            For JSON format: Validated Pydantic model instance of the same type as schema_class
            For markdown format: Raw markdown content as string
            
        Raises:
            requests.RequestException: If the API request fails
            ValueError: If the response is invalid or both temperature and top_p are provided
        """
        # Validate that both temperature and top_p are not provided simultaneously
        if temperature is not None and top_p is not None:
            raise ValueError("Cannot specify both 'temperature' and 'top_p' parameters. Please use only one.")
        
        # Determine format and schema based on arguments
        if isinstance(schema_class_or_method, str) and schema_class_or_method == 'markdown':
            # Markdown extraction
            extraction_method = 'markdown'
            schema_class = None
        else:
            # JSON extraction
            extraction_method = format or 'json'
            schema_class = schema_class_or_method
            
        # Validate format and schema requirements
        if extraction_method == 'json' and schema_class is None:
            raise ValueError("json_schema is required when format is 'json'")
        if extraction_method == 'markdown' and schema_class is not None:
            raise ValueError("json_schema should not be defined when format is 'markdown'")
        
        payload = {
            "url": url,
            "format": extraction_method
        }
        
        # Add schema for JSON format
        if extraction_method == 'json' and schema_class:
            schema = self._pydantic_to_json_schema(schema_class)
            payload["json_schema"] = schema
        
        # Add optional parameters to payload if provided
        if reasoning_effort is not None:
            payload["reasoning_effort"] = reasoning_effort
        if prompt is not None:
            payload["prompt"] = prompt
        if top_p is not None:
            payload["top_p"] = top_p
        if temperature is not None:
            payload["temperature"] = temperature
        
        try:
            response = self.session.post(
                f"{self.base_url}/extract",
                json=payload,
                timeout=timeout,
                headers={"Content-Type": "application/json"}
            )
            response.raise_for_status()
            
            try:
                result = response.json()
            except (json.JSONDecodeError, ValueError) as e:
                raise ValueError(f"Invalid JSON response: {e}")
                
            if not result.get('success'):
                raise ValueError(f"API returned error: {result.get('error', 'Unknown error')}")
            
            # Return based on format
            if extraction_method == 'markdown':
                return result['data']
            else:
                # Return validated Pydantic model instance for JSON format
                return schema_class.model_validate(result['data'])
            
        except requests.RequestException as e:
            raise requests.RequestException(f"API request failed: {e}")