"""
Test suite for the Python Structured Scraper Client SDK for Mock Unit Tests
"""

import pytest
import requests
from unittest.mock import Mock, patch

from src.scraper import ScraperClient
from tests.schemas.recipe_schema import RecipeSchema
from tests.schemas.article_schema import ArticleSchema

class TestScraperClient:
    """Test cases for ScraperClient functionality"""
    
    @pytest.fixture
    def client(self):
        """Create a ScraperClient instance for testing"""
        return ScraperClient()
    
    @pytest.fixture
    def mock_recipe_response(self):
        """Mock successful recipe scraping response"""
        return {
            "success": True,
            "data": {
                "title": "Butter Chicken",
                "description": "Creamy and delicious butter chicken recipe",
                "image_url": "https://example.com/image.jpg",
                "author": "Recipe Tin Eats",
                "video_url": "https://example.com/video.mp4",
                "categories": ["Indian", "Main Course"],
                "cuisine": "Indian",
                "time": {
                    "cook": 30,
                    "prep": 15,
                    "total": 45
                },
                "ingredient_groups": [{
                    "purpose": "Main ingredients",
                    "ingredients": [{
                        "name": "chicken",
                        "preparation": "diced",
                        "purpose": "protein",
                        "measures": {
                            "metric": {
                                "amount": 500.0,
                                "unitShort": "g",
                                "unitLong": "grams"
                            },
                            "imperial": {
                                "amount": 1.1,
                                "unitShort": "lb",
                                "unitLong": "pounds"
                            }
                        }
                    }]
                }],
                "steps": ["Step 1", "Step 2"],
                "servings": 4,
                "additional_notes": "Serve with basmati rice and naan bread",
                "rating": {
                    "rating": 4.5,
                    "count": 100
                },
                "locale": "en-US"
            }
        }
    
    @pytest.fixture
    def mock_article_response(self):
        """Mock successful article scraping response"""
        return {
            "success": True,
            "data": {
                "title": "Breaking News: Important Event",
                "content": "This is the article content...",
                "author": "BBC News Reporter",
                "date": "2024-01-15",
                "important_quotes": ["IMPORTANT QUOTE 1", "IMPORTANT QUOTE 2"]
            }
        }
    
    @pytest.fixture
    def mock_error_response(self):
        """Mock error response from API"""
        return {
            "success": False,
            "error": "Failed to scrape the provided URL"
        }

    def test_client_initialization_default(self):
        """Test ScraperClient initialization with default parameters"""
        client = ScraperClient()
        assert client.base_url is not None
        assert hasattr(client, 'session')
        assert isinstance(client.session, requests.Session)

    def test_client_initialization_custom_url(self):
        """Test ScraperClient initialization with custom URL"""
        custom_url = "https://custom-api.example.com"
        client = ScraperClient(custom_url)
        assert client.base_url == custom_url

    def test_client_initialization_strips_trailing_slash(self):
        """Test that trailing slash is stripped from base URL"""
        url_with_slash = "https://api.example.com/"
        client = ScraperClient(url_with_slash)
        assert client.base_url == "https://api.example.com"

    def test_pydantic_to_json_schema_conversion(self, client: ScraperClient):
        """Test conversion of Pydantic schema to JSON schema"""
        schema = client._pydantic_to_json_schema(RecipeSchema)
        
        assert isinstance(schema, dict)
        assert "type" in schema
        assert "properties" in schema
        assert "title" in schema["properties"]
        assert "author" in schema["properties"]
        # Ensure $defs are resolved and removed
        assert "$defs" not in schema

    # New parameter validation tests
    @patch('src.scraper.requests.Session.post')
    def test_new_parameters_included_in_payload(self, mock_post: Mock, client: ScraperClient, mock_recipe_response):
        """Test that new parameters are correctly included in API payload"""
        mock_response = Mock()
        mock_response.json.return_value = mock_recipe_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test with all new parameters
        client.scrape(
            "https://example.com", 
            RecipeSchema,
            reasoning_effort="high",
            prompt="Custom prompt",
            # top_p=0.9, - API validates if both top_p and temp are present 
            temperature=1.5
        )
        
        # Verify the API call was made with correct parameters
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        
        assert payload['reasoning_effort'] == "high"
        assert payload['prompt'] == "Custom prompt"
        assert payload['temperature'] == 1.5
        assert 'url' in payload
        assert 'schema' in payload

    @patch('src.scraper.requests.Session.post')
    def test_optional_parameters_not_included_when_none(self, mock_post: Mock, client: ScraperClient, mock_recipe_response):
        """Test that optional parameters are not included in payload when None"""
        mock_response = Mock()
        mock_response.json.return_value = mock_recipe_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test with no optional parameters
        client.scrape("https://example.com", RecipeSchema)
        
        # Verify the API call was made without optional parameters
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        
        assert 'reasoning_effort' not in payload
        assert 'prompt' not in payload
        assert 'top_p' not in payload
        assert 'temperature' not in payload
        assert 'url' in payload
        assert 'schema' in payload

    @patch('src.scraper.requests.Session.post')
    def test_reasoning_effort_parameter_validation(self, mock_post: Mock, client: ScraperClient, mock_recipe_response):
        """Test reasoning_effort parameter accepts valid values"""
        mock_response = Mock()
        mock_response.json.return_value = mock_recipe_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test valid reasoning_effort values
        valid_efforts = ["medium", "high"]
        
        for effort in valid_efforts:
            client.scrape(
                "https://example.com", 
                RecipeSchema,
                reasoning_effort=effort
            )
            
            call_args = mock_post.call_args
            payload = call_args[1]['json']
            assert payload['reasoning_effort'] == effort

    @patch('src.scraper.requests.Session.post')
    def test_temperature_parameter_types(self, mock_post: Mock, client: ScraperClient, mock_recipe_response):
        """Test temperature parameter accepts int and float values"""
        mock_response = Mock()
        mock_response.json.return_value = mock_recipe_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test with integer temperature
        client.scrape(
            "https://example.com", 
            RecipeSchema,
            temperature=1
        )
        
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        assert payload['temperature'] == 1
        
        # Test with float temperature
        client.scrape(
            "https://example.com", 
            RecipeSchema,
            temperature=1.5
        )
        
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        assert payload['temperature'] == 1.5

    @patch('src.scraper.requests.Session.post')
    def test_top_p_parameter_types(self, mock_post: Mock, client: ScraperClient, mock_recipe_response):
        """Test top_p parameter accepts int and float values"""
        mock_response = Mock()
        mock_response.json.return_value = mock_recipe_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test with float top_p
        client.scrape(
            "https://example.com", 
            RecipeSchema,
            top_p=0.9
        )
        
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        assert payload['top_p'] == 0.9
        
        # Test with integer top_p
        client.scrape(
            "https://example.com", 
            RecipeSchema,
            top_p=1
        )
        
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        assert payload['top_p'] == 1

    @patch('src.scraper.requests.Session.post')
    def test_temperature_and_top_p_validation_error(self, mock_post: Mock, client: ScraperClient):
        """Test that providing both temperature and top_p raises ValueError"""
        with pytest.raises(ValueError, match="Cannot specify both 'temperature' and 'top_p' parameters. Please use only one."):
            client.scrape(
                "https://example.com", 
                RecipeSchema,
                temperature=1.0,
                top_p=0.9
            )

    @patch('src.scraper.requests.Session.post')
    def test_successful_recipe_scraping(self, mock_post: Mock, client: ScraperClient, mock_recipe_response):
        """Test successful recipe scraping with mock response"""
        # Setup mock response
        mock_response = Mock()
        mock_response.json.return_value = mock_recipe_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test scraping
        url = "https://www.recipetineats.com/butter-chicken/"
        result = client.scrape(url, RecipeSchema, prompt="Focus on ingredients")
        
        # Assertions
        assert isinstance(result, RecipeSchema)
        assert result.title == "Butter Chicken"
        assert result.author == "Recipe Tin Eats"
        assert result.servings == 4
        assert result.time.total == 45
        assert len(result.ingredient_groups) == 1
        assert result.rating.rating == 4.5
        
        # Verify API call
        call_args = mock_post.call_args
        assert call_args[0][0] == f"{client.base_url}/scrape"
        payload = call_args[1]['json']
        assert payload['url'] == url
        assert 'schema' in payload
        assert payload['prompt'] == "Focus on ingredients"

    @patch('src.scraper.requests.Session.post')
    def test_successful_article_scraping(self, mock_post: Mock, client: ScraperClient, mock_article_response):
        """Test successful article scraping with mock response"""
        # Setup mock response
        mock_response = Mock()
        mock_response.json.return_value = mock_article_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test scraping
        url = "https://www.bbc.co.uk/news/articles/clyrev00lwno"
        result = client.scrape(url, ArticleSchema)
        
        # Assertions
        assert isinstance(result, ArticleSchema)
        assert result.title == "Breaking News: Important Event"
        assert result.author == "BBC News Reporter"
        assert result.date == "2024-01-15"
        assert len(result.important_quotes) == 2
        assert all(quote == quote.upper() for quote in result.important_quotes)
        
        # Verify API call
        call_args = mock_post.call_args
        payload = call_args[1]['json']
        assert payload['url'] == url
        assert 'schema' in payload

    @patch('src.scraper.requests.Session.post')
    def test_api_error_response(self, mock_post: Mock, client: ScraperClient, mock_error_response):
        """Test handling of API error responses"""
        # Setup mock response
        mock_response = Mock()
        mock_response.json.return_value = mock_error_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test that ValueError is raised for API errors
        with pytest.raises(ValueError, match="API returned error: Failed to scrape the provided URL"):
            client.scrape("https://example.com", ArticleSchema)

    @patch('src.scraper.requests.Session.post')
    def test_network_error_handling(self, mock_post: Mock, client: ScraperClient):
        """Test handling of network errors"""
        # Setup mock to throw requests exception
        mock_post.side_effect = requests.ConnectionError("Connection failed")
        
        # Test that RequestException is raised and properly wrapped
        with pytest.raises(requests.RequestException, match="API request failed: Connection failed"):
            client.scrape("https://example.com", ArticleSchema)

    @patch('src.scraper.requests.Session.post')
    def test_invalid_json_response(self, mock_post: Mock, client: ScraperClient):
        """Test handling of invalid JSON responses"""
        # Setup mock response with invalid JSON
        mock_response = Mock()
        mock_response.json.side_effect = ValueError("Invalid JSON")
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test that ValueError is raised for invalid JSON
        with pytest.raises(ValueError, match="Invalid JSON response: Invalid JSON"):
            client.scrape("https://example.com", ArticleSchema)

    @patch('src.scraper.requests.Session.post')
    def test_http_error_handling(self, mock_post: Mock, client: ScraperClient):
        """Test handling of HTTP errors (4xx, 5xx)"""
        # Setup mock response to raise HTTP error
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("404 Not Found")
        mock_post.return_value = mock_response
        
        # Test that HTTPError is raised
        with pytest.raises(requests.RequestException, match="API request failed: 404 Not Found"):
            client.scrape("https://example.com", ArticleSchema)

    @patch('src.scraper.requests.Session.post')
    def test_timeout_parameter(self, mock_post: Mock, client: ScraperClient):
        """Test that timeout parameter is correctly passed to requests"""
        mock_response = Mock()
        mock_response.json.return_value = {
            "success": True,
            "data": {
                "title": "Test",
                "content": "Test content",
                "author": "Test Author",
                "date": "2024-01-01",
                "important_quotes": []
            }
        }
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test with custom timeout
        client.scrape("https://example.com", ArticleSchema, timeout=30)
        
        # Verify timeout was passed to requests
        call_args = mock_post.call_args
        assert call_args[1]['timeout'] == 30

