"""
Test suite for the Python Structured Scraper Client SDK for Mock Unit Tests
"""

import pytest

from src.scraper import ScraperClient
from tests.schemas.recipe_schema import RecipeSchema
from tests.schemas.article_schema import ArticleSchema

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
