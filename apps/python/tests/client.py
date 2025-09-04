"""
Test suite for the Python Structured Scraper Client SDK
"""

import pytest
import requests
from unittest.mock import Mock, patch, MagicMock
from typing import Dict, Any

from src.scraper import ScraperClient
from tests.recipe_schema import RecipeSchema
from tests.article_schema import ArticleSchema


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
                "steps": ["Heat oil in pan", "Add chicken and cook"],
                "servings": 4,
                "additional_notes": "Serve with rice",
                "rating": {
                    "rating": 4.5,
                    "count": 150
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
                "content": "This is the main content of the article with important information.",
                "author": "BBC News Reporter",
                "date": "2024-01-15",
                "important_quotes": ["THIS IS AN IMPORTANT QUOTE", "ANOTHER SIGNIFICANT STATEMENT"]
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
        """Test ScraperClient initialization with custom base URL"""
        custom_url = "https://custom-api.example.com"
        client = ScraperClient(base_url=custom_url)
        assert client.base_url == custom_url
    
    def test_client_initialization_strips_trailing_slash(self):
        """Test that trailing slash is stripped from base URL"""
        url_with_slash = "https://api.example.com/"
        client = ScraperClient(base_url=url_with_slash)
        assert client.base_url == "https://api.example.com"
    
    def test_pydantic_to_json_schema_conversion(self, client):
        """Test conversion of Pydantic schema to JSON schema"""
        schema = client._pydantic_to_json_schema(ArticleSchema)
        
        assert isinstance(schema, dict)
        assert "properties" in schema
        assert "title" in schema["properties"]
        assert "content" in schema["properties"]
        assert "author" in schema["properties"]
        assert "date" in schema["properties"]
        assert "important_quotes" in schema["properties"]
    
    @patch('src.scraper.requests.Session.post')
    def test_successful_recipe_scraping(self, mock_post, client, mock_recipe_response):
        """Test successful recipe scraping with all parameters"""
        # Setup mock response
        mock_response = Mock()
        mock_response.json.return_value = mock_recipe_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test scraping
        url = "https://www.recipetineats.com/butter-chicken/"
        result = client.scrape(
            url=url,
            schema_class=RecipeSchema,
            method="thorough",
            prompt="Focus on extracting detailed cooking instructions"
        )
        
        # Assertions
        assert isinstance(result, RecipeSchema)
        assert result.title == "Butter Chicken"
        assert result.author == "Recipe Tin Eats"
        assert result.servings == 4
        assert result.time.total == 45
        assert len(result.ingredient_groups) == 1
        assert result.rating.rating == 4.5
        
        # Verify API call
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert call_args[1]['json']['url'] == url
        assert call_args[1]['json']['method'] == "thorough"
        assert call_args[1]['json']['prompt'] == "Focus on extracting detailed cooking instructions"
    
    @patch('src.scraper.requests.Session.post')
    def test_successful_article_scraping(self, mock_post, client, mock_article_response):
        """Test successful article scraping with minimal parameters"""
        # Setup mock response
        mock_response = Mock()
        mock_response.json.return_value = mock_article_response
        mock_response.raise_for_status.return_value = None
        mock_post.return_value = mock_response
        
        # Test scraping
        url = "https://www.bbc.co.uk/news/articles/clyrev00lwno"
        result = client.scrape(url=url, schema_class=ArticleSchema)
        
        # Assertions
        assert isinstance(result, ArticleSchema)
        assert result.title == "Breaking News: Important Event"
        assert result.author == "BBC News Reporter"
        assert result.date == "2024-01-15"
        assert len(result.important_quotes) == 2
        assert all(quote.isupper() for quote in result.important_quotes)
        
        # Verify API call
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert call_args[1]['json']['url'] == url
        assert call_args[1]['json']['method'] == "fast"  # default method
        assert 'prompt' not in call_args[1]['json']  # no prompt provided
    
    @patch('src.scraper.requests.Session.post')
    def test_api_error_response(self, mock_post, client, mock_error_response):
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
    def test_network_error_handling(self, mock_post, client):
        """Test handling of network errors"""
        # Setup mock to raise RequestException
        mock_post.side_effect = requests.RequestException("Connection failed")
        
        # Test that RequestException is raised and properly wrapped
        with pytest.raises(requests.RequestException, match="API request failed: Connection failed"):
            client.scrape("https://example.com", ArticleSchema)
    
    @patch('src.scraper.requests.Session.post')
    def test_invalid_json_response(self, mock_post, client):
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
    def test_http_error_handling(self, mock_post, client):
        """Test handling of HTTP errors (4xx, 5xx)"""
        # Setup mock response to raise HTTP error
        mock_response = Mock()
        mock_response.raise_for_status.side_effect = requests.HTTPError("404 Not Found")
        mock_post.return_value = mock_response
        
        # Test that HTTPError is raised
        with pytest.raises(requests.RequestException, match="API request failed: 404 Not Found"):
            client.scrape("https://example.com", ArticleSchema)
    
    def test_scrape_method_parameters(self, client):
        """Test that scrape method accepts all valid method parameters"""
        valid_methods = ["fast", "balanced", "thorough"]
        
        for method in valid_methods:
            with patch('src.scraper.requests.Session.post') as mock_post:
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
                
                # This should not raise any errors
                result = client.scrape("https://example.com", ArticleSchema, method=method)
                assert isinstance(result, ArticleSchema)
    
    @patch('src.scraper.requests.Session.post')
    def test_timeout_parameter(self, mock_post, client):
        """Test that timeout parameter is passed correctly"""
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
        client.scrape("https://example.com", ArticleSchema, timeout=60)
        
        # Verify timeout was passed to the request
        mock_post.assert_called_once()
        call_args = mock_post.call_args
        assert call_args[1]['timeout'] == 60


class TestIntegration:
    """Integration tests for real API calls (optional - requires actual API)"""
    
    @pytest.mark.integration
    @pytest.mark.skip(reason="Requires actual API endpoint and may be slow")
    def test_real_recipe_scraping(self):
        """Integration test with real recipe URL (skipped by default)"""
        client = ScraperClient()
        url = "https://www.recipetineats.com/butter-chicken/"
        
        result = client.scrape(url, RecipeSchema, method="fast")
        
        assert isinstance(result, RecipeSchema)
        assert result.title
        assert result.author
        assert len(result.steps) > 0
    
    @pytest.mark.integration
    @pytest.mark.skip(reason="Requires actual API endpoint and may be slow")
    def test_real_article_scraping(self):
        """Integration test with real article URL (skipped by default)"""
        client = ScraperClient()
        url = "https://www.bbc.co.uk/news/articles/clyrev00lwno"
        
        result = client.scrape(url, ArticleSchema)
        
        assert isinstance(result, ArticleSchema)
        assert result.title
        assert result.content
        assert result.author
