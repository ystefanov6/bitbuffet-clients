"""
Module to test the Python client SDK
"""

from src.scraper import ScraperClient
from tests.recipe_schema import RecipeSchema
from tests.article_schema import ArticleSchema

url_recipe = "https://www.recipetineats.com/butter-chicken/"
url_article = "https://www.bbc.co.uk/news/articles/clyrev00lwno"

client = ScraperClient()

# Test with new parameters
# result_recipe = client.scrape(
#     url_recipe, 
#     RecipeSchema, 
#     method="thorough", 
#     prompt="Focus on extracting detailed cooking instructions and ingredient measurements"
# )   
# print(result_recipe)

# Test article scraping with balanced method and custom prompt
result_article = client.scrape(
    url_article, 
    ArticleSchema
)   
print(result_article)
